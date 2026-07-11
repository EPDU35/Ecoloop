import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.eco_points import EcoPointAccount, EcoPointTransaction, EcoPointStatus, TransactionType
from app.models.transaction import Transaction, TransactionStatus
from app.models.waste import WasteLot, LotStatus
from app.models.purchase_offer import PurchaseOffer, OfferStatus
from app.models.pricing_rule import PricingRule
from app.models.system_config import SystemConfig
from app.models.dispute import Dispute, DisputeReason, DisputeStatus
from app.models.rating_event import RatingEvent
from app.models.collector_profile import CollectorProfile
from app.models.company_profile import CompanyProfile
from app.models.household_profile import HouseholdProfile
from app.models.audit_log import AuditLog


class EcoPointsError(Exception):
    pass


class EcoPointsService:
    @staticmethod
    async def get_or_create_account(db: AsyncSession, user_id: uuid.UUID) -> EcoPointAccount:
        result = await db.execute(
            select(EcoPointAccount).where(EcoPointAccount.user_id == user_id)
        )
        account = result.scalar_one_or_none()
        if not account:
            account = EcoPointAccount(user_id=user_id, eco_points_balance_cache=0.0)
            db.add(account)
            await db.flush()
        return account

    @staticmethod
    async def recalculate_and_cache_balance(db: AsyncSession, account_id: uuid.UUID) -> float:
        # Sum of transactions that are AVAILABLE or USED
        result = await db.execute(
            select(func.sum(EcoPointTransaction.amount)).where(
                EcoPointTransaction.account_id == account_id,
                EcoPointTransaction.status.in_([EcoPointStatus.AVAILABLE, EcoPointStatus.USED])
            )
        )
        total = result.scalar() or 0.0
        
        # Update cache in account
        account_result = await db.execute(
            select(EcoPointAccount).where(EcoPointAccount.id == account_id)
        )
        account = account_result.scalar_one()
        account.eco_points_balance_cache = float(total)
        await db.flush()
        return float(total)

    @staticmethod
    async def log_audit(db: AsyncSession, user_id: uuid.UUID | None, action: str, entity_type: str, entity_id: uuid.UUID, old_val: dict | None, new_val: dict | None):
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_val,
            new_value=new_val
        )
        db.add(log)
        await db.flush()

    @staticmethod
    async def get_system_config(db: AsyncSession, key: str, default: str) -> str:
        result = await db.execute(
            select(SystemConfig).where(SystemConfig.key == key)
        )
        config = result.scalar_one_or_none()
        return config.value if config else default

    @staticmethod
    async def process_marketplace_payout(
        db: AsyncSession,
        transaction_id: uuid.UUID,
        idempotency_key: str
    ) -> Transaction:
        # 1. Idempotency Check
        idem_result = await db.execute(
            select(Transaction).where(Transaction.idempotency_key == idempotency_key)
        )
        existing_tx = idem_result.scalar_one_or_none()
        if existing_tx:
            return existing_tx

        # 2. Fetch Transaction
        tx_result = await db.execute(
            select(Transaction).where(Transaction.id == transaction_id)
        )
        tx = tx_result.scalar_one_or_none()
        if not tx:
            raise EcoPointsError("Transaction introuvable.")

        if tx.status == TransactionStatus.PAYEE:
            raise EcoPointsError("Cette transaction a déjà été payée.")

        # Fetch Lot
        lot_result = await db.execute(
            select(WasteLot).where(WasteLot.id == tx.lot_id)
        )
        lot = lot_result.scalar_one_or_none()
        if not lot:
            raise EcoPointsError("Lot de déchets associé introuvable.")

        # 3. Determine price per kg via accepted PurchaseOffer or active PricingRule
        offer_result = await db.execute(
            select(PurchaseOffer).where(
                PurchaseOffer.lot_id == lot.id,
                PurchaseOffer.status == OfferStatus.ACCEPTED
            )
        )
        offer = offer_result.scalar_one_or_none()
        
        price_applied = 0.0
        if offer:
            price_applied = float(offer.price_per_kg)
        else:
            rule_result = await db.execute(
                select(PricingRule).where(
                    PricingRule.material == lot.category.value,
                    PricingRule.active == True
                )
            )
            rule = rule_result.scalar_one_or_none()
            price_applied = float(rule.price_per_kg) if rule else float(lot.price_per_kg)

        weight = float(lot.actual_weight_kg or lot.weight_kg)
        gross_amount = price_applied * weight

        # 4. Compute commission and reward based on system config
        commission_rate_str = await EcoPointsService.get_system_config(db, "ecoloop_commission_rate", "0.20")
        commission_rate = float(commission_rate_str)
        commission = gross_amount * commission_rate
        reward = gross_amount - commission

        # Keep original values for audit
        old_tx_val = {
            "status": tx.status.value,
            "net_amount": float(tx.net_amount) if tx.net_amount else None
        }

        # Update Transaction with pricing snapshot and V3.4 fields
        tx.material = lot.category.value
        tx.price_per_kg_applied = price_applied
        tx.weight_applied = weight
        tx.amount_paid_by_company = gross_amount
        tx.ecoloop_commission = commission
        tx.household_reward = reward
        tx.status = TransactionStatus.PAYEE
        tx.payment_status = "SUCCESS"
        tx.idempotency_key = idempotency_key
        tx.paid_at = datetime.now(timezone.utc)

        # Update Lot status
        lot.status = LotStatus.PAYE
        lot.quality_status = "VALIDATED"
        lot.quality_verified_at = datetime.now(timezone.utc)

        # 5. Create EcoPoint Ledger Transactions
        account = await EcoPointsService.get_or_create_account(db, lot.producer_id)
        
        # Verify if an EcoPointTransaction already exists for this transaction
        point_tx_result = await db.execute(
            select(EcoPointTransaction).where(
                EcoPointTransaction.related_transaction_id == tx.id,
                EcoPointTransaction.type == TransactionType.LOT_PAYMENT
            )
        )
        existing_point_tx = point_tx_result.scalar_one_or_none()
        
        if not existing_point_tx:
            point_tx = EcoPointTransaction(
                account_id=account.id,
                amount=reward,
                type=TransactionType.LOT_PAYMENT,
                status=EcoPointStatus.AVAILABLE,  # Verified and available
                related_transaction_id=tx.id
            )
            db.add(point_tx)
            await db.flush()

        await EcoPointsService.recalculate_and_cache_balance(db, account.id)

        # Log audit log
        new_tx_val = {
            "status": tx.status.value,
            "net_amount": reward,
            "idempotency_key": idempotency_key
        }
        await EcoPointsService.log_audit(db, lot.producer_id, "MARKETPLACE_PAYOUT", "transactions", tx.id, old_tx_val, new_tx_val)

        return tx

    @staticmethod
    async def open_dispute(
        db: AsyncSession,
        transaction_id: uuid.UUID,
        opened_by_id: uuid.UUID,
        reason: DisputeReason
    ) -> Dispute:
        # Create Dispute
        dispute = Dispute(
            transaction_id=transaction_id,
            opened_by_id=opened_by_id,
            reason=reason,
            status=DisputeStatus.OPEN
        )
        db.add(dispute)
        await db.flush()

        # Find EcoPointTransaction linked to this transaction and LOCK it
        point_tx_result = await db.execute(
            select(EcoPointTransaction).where(
                EcoPointTransaction.related_transaction_id == transaction_id
            )
        )
        point_txs = point_tx_result.scalars().all()
        for ptx in point_txs:
            ptx.status = EcoPointStatus.LOCKED
            await EcoPointsService.recalculate_and_cache_balance(db, ptx.account_id)

        return dispute

    @staticmethod
    async def resolve_dispute(
        db: AsyncSession,
        dispute_id: uuid.UUID,
        resolved_by_id: uuid.UUID,
        status: DisputeStatus,
        details: str
    ) -> Dispute:
        result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
        dispute = result.scalar_one_or_none()
        if not dispute:
            raise EcoPointsError("Litige introuvable.")

        dispute.status = status
        dispute.resolution_details = details
        dispute.resolved_by_id = resolved_by_id
        dispute.resolved_at = datetime.now(timezone.utc)

        # Update linked EcoPoints transactions status
        point_tx_result = await db.execute(
            select(EcoPointTransaction).where(
                EcoPointTransaction.related_transaction_id == dispute.transaction_id
            )
        )
        point_txs = point_tx_result.scalars().all()

        new_status = EcoPointStatus.AVAILABLE if status == DisputeStatus.RESOLVED else EcoPointStatus.CANCELLED
        for ptx in point_txs:
            ptx.status = new_status
            await EcoPointsService.recalculate_and_cache_balance(db, ptx.account_id)

        return dispute

    @staticmethod
    async def request_withdrawal(
        db: AsyncSession,
        user_id: uuid.UUID,
        amount: float,
        phone: str,
        idempotency_key: str
    ) -> EcoPointTransaction:
        # Idempotency lookup
        idem_result = await db.execute(
            select(EcoPointTransaction).where(EcoPointTransaction.idempotency_key == idempotency_key)
        )
        existing_tx = idem_result.scalar_one_or_none()
        if existing_tx:
            return existing_tx

        account = await EcoPointsService.get_or_create_account(db, user_id)
        current_balance = account.eco_points_balance_cache

        if current_balance < amount:
            raise EcoPointsError("Solde d'EcoPoints disponible insuffisant.")

        # Create withdrawal ledger entry (negative amount)
        withdrawal_tx = EcoPointTransaction(
            account_id=account.id,
            amount=-amount,
            type=TransactionType.WITHDRAW,
            status=EcoPointStatus.USED,
            idempotency_key=idempotency_key
        )
        db.add(withdrawal_tx)
        await db.flush()

        await EcoPointsService.recalculate_and_cache_balance(db, account.id)
        return withdrawal_tx

    @staticmethod
    async def log_rating_event(
        db: AsyncSession,
        user_id: uuid.UUID,
        actor_id: uuid.UUID,
        event_type: str,
        impact_score: float,
        reason: str
    ) -> RatingEvent:
        event = RatingEvent(
            user_id=user_id,
            actor_id=actor_id,
            event_type=event_type,
            impact_score=impact_score,
            reason=reason
        )
        db.add(event)
        await db.flush()

        # Update specific profile score based on target user profile exists
        # 1. Household check
        household_result = await db.execute(
            select(HouseholdProfile).where(HouseholdProfile.user_id == user_id)
        )
        household = household_result.scalar_one_or_none()
        if household:
            new_score = max(0.0, min(1.0, household.seller_reliability_score + impact_score))
            household.seller_reliability_score = new_score

        # 2. Collector check
        collector_result = await db.execute(
            select(CollectorProfile).where(CollectorProfile.id == user_id)
        )
        collector = collector_result.scalar_one_or_none()
        if collector:
            # Handle newcomer boost
            if collector.new_partner_boost and collector.completed_missions >= 5:
                collector.new_partner_boost = False
            
            new_score = max(0.0, min(1.0, collector.collector_reliability_score + impact_score))
            collector.collector_reliability_score = new_score

        # 3. Company check
        company_result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.company_id == user_id)
        )
        company = company_result.scalar_one_or_none()
        if company:
            new_score = max(0.0, min(1.0, company.buyer_reliability_score + impact_score))
            company.buyer_reliability_score = new_score

        await db.flush()
        return event
