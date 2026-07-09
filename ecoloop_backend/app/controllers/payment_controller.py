from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collection import Collection
from app.models.reward import Reward
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.models.waste import WasteLot
from app.schemas.transaction_schema import TransactionCreateSchema
from app.services.payment_service import PaymentError, create_transaction_for_collection
from app.services.ai_service import ai_service


async def create_transaction(db: AsyncSession, current_user: User, payload: TransactionCreateSchema) -> Transaction:
    result = await db.execute(select(Collection).where(Collection.id == payload.collection_id))
    collection = result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")

    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id))
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot associé introuvable.")

    if current_user.id not in (lot.producer_id, collection.collector_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Action non autorisée sur cette collecte.")

    # AI Fraud check on transaction
    try:
        fraud_result = await ai_service.check_fraud({
            "poids": float(collection.actual_weight_kg or lot.weight_kg),
            "prix": float(lot.price_per_kg),
            "user_id": str(current_user.id),
            "heure": datetime.now(timezone.utc).hour,
            "jour_semaine": datetime.now(timezone.utc).weekday(),
        })
        if fraud_result.get("is_fraudulent") and fraud_result.get("fraud_score", 0) > 0.8:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Transaction suspecte détectée. Veuillez contacter le support."
            )
    except HTTPException:
        raise
    except Exception:
        pass  # AI service unavailable - proceed without fraud check

    try:
        transaction = await create_transaction_for_collection(db, collection, lot, payload.payment_method)
    except PaymentError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    reward_result = await db.execute(select(Reward).where(Reward.user_id == lot.producer_id))
    reward = reward_result.scalar_one_or_none()
    if reward is not None and collection.actual_weight_kg:
        reward.total_kg_recycled += float(collection.actual_weight_kg)
        reward.points += int(float(collection.actual_weight_kg) * 10)
        if reward.total_kg_recycled >= 1000:
            reward.level = "or"
        elif reward.total_kg_recycled >= 300:
            reward.level = "argent"
        else:
            reward.level = "bronze"

    await db.flush()
    return transaction


async def mark_transaction_paid(db: AsyncSession, transaction_id, external_reference: str) -> Transaction:
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id).with_for_update())
    transaction = result.scalar_one_or_none()
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction introuvable.")

    if transaction.status == TransactionStatus.PAYEE:
        return transaction

    transaction.status = TransactionStatus.PAYEE
    transaction.external_reference = external_reference
    transaction.paid_at = datetime.now(timezone.utc)
    await db.flush()
    return transaction


async def list_transaction_history(db: AsyncSession, current_user: User, limit: int = 50, offset: int = 0) -> list[Transaction]:
    query = (
        select(Transaction)
        .where(or_(Transaction.producer_id == current_user.id, Transaction.collector_id == current_user.id))
        .order_by(Transaction.created_at.desc())
        .limit(min(limit, 100))
        .offset(max(offset, 0))
    )
    result = await db.execute(query)
    return list(result.scalars().all())
