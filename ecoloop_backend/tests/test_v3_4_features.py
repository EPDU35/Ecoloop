import asyncio
import pytest
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.config.database import Base
from app.models.user import User, UserRole
from app.models.waste import WasteLot, WasteCategory, LotStatus
from app.models.purchase_offer import PurchaseOffer, OfferStatus
from app.models.pricing_rule import PricingRule
from app.models.eco_points import EcoPointAccount, EcoPointTransaction, EcoPointStatus, TransactionType
from app.models.transaction import Transaction, TransactionStatus
from app.models.dispute import Dispute, DisputeReason, DisputeStatus
from app.models.rating_event import RatingEvent
from app.models.collector_profile import CollectorProfile, CollectorType
from app.models.company_profile import CompanyProfile
from app.models.household_profile import HouseholdProfile
from app.models.system_config import SystemConfig
from app.services.eco_points_service import EcoPointsService, EcoPointsError


async def setup_db_session():
    # Set up in-memory sqlite engine for isolated integration testing
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    return engine, session_factory


async def create_test_users(db: AsyncSession):
    producer = User(
        id=uuid.uuid4(),
        full_name="Aïcha Diallo",
        email="aicha@ecoloop.com",
        phone="+22501020304",
        hashed_password="password",
        role=UserRole.PRODUCTEUR
    )
    collector_user = User(
        id=uuid.uuid4(),
        full_name="Moussa Fofana",
        email="moussa@ecoloop.com",
        phone="+22505060708",
        hashed_password="password",
        role=UserRole.COLLECTEUR
    )
    company_user = User(
        id=uuid.uuid4(),
        full_name="Recycle CI",
        email="recycle@ecoloop.com",
        phone="+22509101112",
        hashed_password="password",
        role=UserRole.INDUSTRIEL
    )
    admin_user = User(
        id=uuid.uuid4(),
        full_name="Admin EcoLoop",
        email="admin@ecoloop.com",
        phone="+22513141516",
        hashed_password="password",
        role=UserRole.ADMIN
    )
    db.add_all([producer, collector_user, company_user, admin_user])
    await db.flush()

    # Profiles
    household_profile = HouseholdProfile(user_id=producer.id, seller_reliability_score=1.0)
    collector_profile = CollectorProfile(
        id=collector_user.id,
        collector_type=CollectorType.COLLECTOR_PARTNER,
        collector_reliability_score=1.0,
        reputation_score=1.0
    )
    company_profile = CompanyProfile(
        company_id=company_user.id,
        buyer_reliability_score=1.0
    )
    db.add_all([household_profile, collector_profile, company_profile])
    await db.flush()
    
    return producer, collector_user, company_user, admin_user


def test_payout_with_pricing_rule():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            # Active pricing rule
            pricing_rule = PricingRule(
                material=WasteCategory.PLASTIQUE.value,
                price_per_kg=150.0,
                created_by_id=admin_user.id,
                active=True
            )
            db.add(pricing_rule)

            # Waste lot
            lot = WasteLot(
                producer_id=producer.id,
                collector_id=collector_user.id,
                category=WasteCategory.PLASTIQUE,
                weight_kg=10.0,
                actual_weight_kg=10.0,
                price_per_kg=150.0,
                latitude=5.3,
                longitude=-4.0,
                status=LotStatus.COLLECTE
            )
            db.add(lot)
            await db.flush()

            # Create transaction
            tx = Transaction(
                lot_id=lot.id,
                company_id=company_user.id,
                household_id=producer.id,
                status=TransactionStatus.EN_ATTENTE
            )
            db.add(tx)
            await db.flush()

            idempotency_key = "idem-key-1"

            # Process Payout
            result_tx = await EcoPointsService.process_marketplace_payout(db, tx.id, idempotency_key)
            
            assert result_tx.status == TransactionStatus.PAYEE
            assert result_tx.price_per_kg_applied == 150.0
            assert result_tx.weight_applied == 10.0
            assert result_tx.amount_paid_by_company == 1500.0
            assert result_tx.ecoloop_commission == 300.0  # 20% of 1500
            assert result_tx.household_reward == 1200.0   # 80% of 1500
            assert result_tx.payment_status == "SUCCESS"

            # EcoPoints balance check
            account = await EcoPointsService.get_or_create_account(db, producer.id)
            assert account.eco_points_balance_cache == 1200.0

            # Test Idempotency
            same_tx = await EcoPointsService.process_marketplace_payout(db, tx.id, idempotency_key)
            assert same_tx.id == tx.id
            
            # Recalculate balance again, verify it did not double-credit
            await EcoPointsService.recalculate_and_cache_balance(db, account.id)
            assert account.eco_points_balance_cache == 1200.0
            
        await engine.dispose()
    asyncio.run(run())


def test_payout_with_purchase_offer():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            # Waste lot
            lot = WasteLot(
                producer_id=producer.id,
                collector_id=collector_user.id,
                category=WasteCategory.PLASTIQUE,
                weight_kg=20.0,
                actual_weight_kg=20.0,
                price_per_kg=150.0,
                latitude=5.3,
                longitude=-4.0,
                status=LotStatus.COLLECTE
            )
            db.add(lot)
            await db.flush()

            # Accepted Purchase Offer (override price to 180 FCFA/kg)
            offer = PurchaseOffer(
                lot_id=lot.id,
                company_id=company_user.id,
                price_per_kg=180.0,
                initial_price_per_kg=180.0,
                final_price_per_kg=180.0,
                status=OfferStatus.ACCEPTED,
                accepted_by_user_id=producer.id,
                accepted_at=datetime.now(timezone.utc)
            )
            db.add(offer)

            tx = Transaction(
                lot_id=lot.id,
                company_id=company_user.id,
                household_id=producer.id,
                status=TransactionStatus.EN_ATTENTE
            )
            db.add(tx)
            await db.flush()

            idempotency_key = "idem-key-2"

            result_tx = await EcoPointsService.process_marketplace_payout(db, tx.id, idempotency_key)
            
            assert result_tx.price_per_kg_applied == 180.0
            assert result_tx.weight_applied == 20.0
            assert result_tx.amount_paid_by_company == 3600.0
            assert result_tx.household_reward == 2880.0  # 80% of 3600

            account = await EcoPointsService.get_or_create_account(db, producer.id)
            assert account.eco_points_balance_cache == 2880.0
            
        await engine.dispose()
    asyncio.run(run())


def test_dispute_lifecycle():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            # Lot & Transaction
            lot = WasteLot(
                producer_id=producer.id,
                category=WasteCategory.PLASTIQUE,
                weight_kg=10.0,
                actual_weight_kg=10.0,
                price_per_kg=100.0,
                latitude=5.3,
                longitude=-4.0,
                status=LotStatus.COLLECTE
            )
            db.add(lot)
            await db.flush()

            tx = Transaction(
                lot_id=lot.id,
                company_id=company_user.id,
                household_id=producer.id,
                status=TransactionStatus.EN_ATTENTE
            )
            db.add(tx)
            await db.flush()

            # Success Payout
            await EcoPointsService.process_marketplace_payout(db, tx.id, "idem-key-3")
            account = await EcoPointsService.get_or_create_account(db, producer.id)
            assert account.eco_points_balance_cache == 800.0  # 80% of 1000

            # 1. Open Dispute
            dispute = await EcoPointsService.open_dispute(db, tx.id, producer.id, DisputeReason.WEIGHT_DIFFERENCE)
            assert dispute.status == DisputeStatus.OPEN

            # Point transaction should be LOCKED
            await db.refresh(account)
            # Excluded from balance cache
            assert account.eco_points_balance_cache == 0.0

            # 2. Resolve Dispute (RESOLVED - Release EcoPoints)
            await EcoPointsService.resolve_dispute(db, dispute.id, admin_user.id, DisputeStatus.RESOLVED, "Arbitration successful")
            await db.refresh(account)
            assert account.eco_points_balance_cache == 800.0
            
        await engine.dispose()
    asyncio.run(run())


def test_withdrawals():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            account = await EcoPointsService.get_or_create_account(db, producer.id)
            
            # Manually add points
            point_tx = EcoPointTransaction(
                account_id=account.id,
                amount=1000.0,
                type=TransactionType.LOT_PAYMENT,
                status=EcoPointStatus.AVAILABLE
            )
            db.add(point_tx)
            await db.flush()

            await EcoPointsService.recalculate_and_cache_balance(db, account.id)
            assert account.eco_points_balance_cache == 1000.0

            # 1. Successful withdrawal
            withdrawal = await EcoPointsService.request_withdrawal(db, producer.id, 400.0, "+22501020304", "with-idem-1")
            assert withdrawal.amount == -400.0
            assert withdrawal.type == TransactionType.WITHDRAW
            assert withdrawal.status == EcoPointStatus.USED
            
            await db.refresh(account)
            assert account.eco_points_balance_cache == 600.0

            # Test Idempotency
            same_withdrawal = await EcoPointsService.request_withdrawal(db, producer.id, 400.0, "+22501020304", "with-idem-1")
            assert same_withdrawal.id == withdrawal.id
            
            await db.refresh(account)
            assert account.eco_points_balance_cache == 600.0

            # 2. Insufficient funds raises error
            with pytest.raises(EcoPointsError) as exc_info:
                await EcoPointsService.request_withdrawal(db, producer.id, 700.0, "+22501020304", "with-idem-2")
            assert "insuffisant" in str(exc_info.value)
            
        await engine.dispose()
    asyncio.run(run())


def test_dynamic_trust_score_and_boost():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            # Verify initial profiles
            collector_profile = await db.get(CollectorProfile, collector_user.id)
            assert collector_profile.collector_reliability_score == 1.0
            assert collector_profile.new_partner_boost is True

            # 1. Delayed collection penalty
            await EcoPointsService.log_rating_event(db, collector_user.id, admin_user.id, "LATE_COLLECTION", -0.1, "Chauffeur en retard de 30 mins")
            
            await db.refresh(collector_profile)
            assert collector_profile.collector_reliability_score == pytest.approx(0.9)

            # 2. Complete 5 missions to drop new partner boost
            collector_profile.completed_missions = 5
            await db.flush()

            # Trigger score update log event to evaluate boost status
            await EcoPointsService.log_rating_event(db, collector_user.id, admin_user.id, "SUCCESSFUL_MISSION", 0.05, "Mission accomplie")
            await db.refresh(collector_profile)
            assert collector_profile.collector_reliability_score == pytest.approx(0.95)
            assert collector_profile.new_partner_boost is False
            
        await engine.dispose()
    asyncio.run(run())


def test_ai_onboarding_assistant():
    async def run():
        engine, session_factory = await setup_db_session()
        async with session_factory() as db:
            producer, collector_user, company_user, admin_user = await create_test_users(db)

            from app.api.routes.ai import OnboardingAssistantRequest, onboarding_assistant
            
            # Test Company Onboarding
            req = OnboardingAssistantRequest(text="Je suis un recycleur industriel appelé RecycleNet basé à Abidjan et j'ai une licence.")
            res = await onboarding_assistant(req, db, company_user)
            assert res["status"] == "success"
            assert "COMPANY" in res["message"]
            assert res["extracted_data"]["company_name"] == "RecycleNet"

            # Verify Company Profile in DB
            profile = await db.get(CompanyProfile, company_user.id)
            assert profile is not None
            assert profile.company_name == "RecycleNet"

            # Test Collector Onboarding
            req_coll = OnboardingAssistantRequest(text="Chauffeur logistique avec un camion de 250 kg à Koumassi")
            res_coll = await onboarding_assistant(req_coll, db, collector_user)
            assert "COLLECTOR" in res_coll["message"]
            assert res_coll["extracted_data"]["vehicle_type"] == "Camionette"

            # Verify Collector Profile in DB
            coll_profile = await db.get(CollectorProfile, collector_user.id)
            assert coll_profile is not None
            assert coll_profile.vehicle_type == "Camionette"
            
        await engine.dispose()
    asyncio.run(run())
