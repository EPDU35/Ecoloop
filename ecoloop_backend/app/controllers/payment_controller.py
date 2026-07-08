from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collection import Collection
from app.models.reward import Reward
from app.models.reward_transaction import RewardTransaction, RewardAction
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User
from app.models.waste import WasteLot
from app.schemas.transaction_schema import TransactionCreateSchema
from app.services.payment_service import PaymentError, create_transaction_for_collection
from app.services.notification_service import create_db_notification


async def create_transaction(db: AsyncSession, current_user: User, payload: TransactionCreateSchema) -> Transaction:
    result = await db.execute(select(Collection).where(Collection.id == payload.collection_id))
    collection = result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")

    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id))
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot associé introuvable.")

    # Seuls le producteur du lot ou le collecteur assigné peuvent déclencher le paiement.
    if current_user.id not in (lot.producer_id, collection.collector_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Action non autorisée sur cette collecte.")

    try:
        transaction = await create_transaction_for_collection(db, collection, lot, payload.payment_method)
    except PaymentError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    await db.flush()
    return transaction


async def mark_transaction_paid(db: AsyncSession, transaction_id, external_reference: str) -> Transaction:
    """
    Appelé uniquement par le webhook du prestataire de paiement ou l'administration
    pour confirmer la réussite du paiement.
    """
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id).with_for_update())
    transaction = result.scalar_one_or_none()
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction introuvable.")

    if transaction.status == TransactionStatus.PAYEE:
        return transaction  # idempotence : déjà payé

    # Mettre à jour le statut de la transaction
    transaction.status = TransactionStatus.PAYEE
    transaction.external_reference = external_reference
    transaction.paid_at = datetime.now(timezone.utc)

    # Récupérer la collecte et le lot associés
    col_result = await db.execute(select(Collection).where(Collection.id == transaction.collection_id))
    collection = col_result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Collecte associée introuvable.")

    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id))
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Lot associé introuvable.")

    # Protection contre double récompense : vérifier s'il existe déjà une transaction de récompense
    dup_reward_result = await db.execute(
        select(RewardTransaction).where(
            RewardTransaction.collection_id == collection.id,
            RewardTransaction.action == RewardAction.COLLECTION_COMPLETED
        )
    )
    if dup_reward_result.scalar_one_or_none() is not None:
        # Déjà récompensé, on s'arrête là pour préserver l'idempotence
        await db.flush()
        return transaction

    # Calcul et attribution des points de récompense au producteur
    reward_result = await db.execute(select(Reward).where(Reward.user_id == lot.producer_id).with_for_update())
    reward = reward_result.scalar_one_or_none()
    if reward is None:
        # Lever une exception explicite plutôt que de créer silencieusement un profil,
        # pour éviter de masquer des bugs de migration/création de compte.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Incohérence système : Profil de récompense inexistant pour le producteur."
        )

    if collection.actual_weight_kg:
        points_to_add = int(float(collection.actual_weight_kg) * 10)
        reward.total_kg_recycled += float(collection.actual_weight_kg)
        reward.points += points_to_add

        # Recalculer le niveau
        if reward.total_kg_recycled >= 1000:
            reward.level = "or"
        elif reward.total_kg_recycled >= 300:
            reward.level = "argent"
        else:
            reward.level = "bronze"

        # Créer la transaction de récompense historique (balance_after inclus pour audit)
        reward_tx = RewardTransaction(
            user_id=lot.producer_id,
            collection_id=collection.id,
            action=RewardAction.COLLECTION_COMPLETED,
            points=points_to_add,
            balance_after=reward.points
        )
        db.add(reward_tx)

        # Envoyer les notifications typées
        await create_db_notification(
            db=db,
            user_id=lot.producer_id,
            title="Points de récompense crédités",
            content=f"Félicitations ! Vous avez gagné {points_to_add} points EcoLoop pour votre recyclage de {collection.actual_weight_kg} kg.",
            notification_type="reward_gained",
            entity_type="collection",
            entity_id=collection.id
        )

    await create_db_notification(
        db=db,
        user_id=lot.producer_id,
        title="Paiement reçu",
        content=f"Votre paiement de {transaction.net_amount} FCFA a été traité par {transaction.payment_method.value}.",
        notification_type="payment_received",
        entity_type="transaction",
        entity_id=transaction.id
    )

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
