from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import generate_otp, hash_otp, verify_otp
from app.models.collection import Collection, CollectionStatus
from app.models.user import User
from app.models.waste import LotStatus, WasteLot
from app.schemas.waste_schema import CollectionValidateSchema


async def reserve_lot(db: AsyncSession, collector: User, waste_lot_id) -> tuple[Collection, str]:
    """
    Réservation atomique d'un lot.

    RÈGLE DE SÉCURITÉ / INTÉGRITÉ : verrouillage pessimiste (SELECT ... FOR UPDATE)
    pour empêcher deux collecteurs de réserver le même lot simultanément
    (condition de course classique sur les marketplaces).
    """
    result = await db.execute(
        select(WasteLot).where(WasteLot.id == waste_lot_id).with_for_update()
    )
    lot = result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot introuvable.")

    if lot.status != LotStatus.DISPONIBLE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce lot n'est plus disponible.")

    if lot.producer_id == collector.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vous ne pouvez pas réserver votre propre lot.")

    lot.status = LotStatus.RESERVE
    lot.collector_id = collector.id

    validation_code = generate_otp(6)
    collection = Collection(
        waste_lot_id=lot.id,
        collector_id=collector.id,
        status=CollectionStatus.RESERVEE,
        validation_code_hash=hash_otp(validation_code),
    )
    db.add(collection)
    await db.flush()

    # Le code de validation en clair est renvoyé une seule fois à l'appelant
    # (route) pour transmission au producteur (SMS/notification) — jamais stocké
    # en clair, jamais renvoyé lors d'une consultation ultérieure.
    return collection, validation_code


async def get_collection_or_404(db: AsyncSession, collection_id) -> Collection:
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")
    return collection


async def validate_collection(
    db: AsyncSession, collector: User, collection_id, payload: CollectionValidateSchema
) -> Collection:
    result = await db.execute(
        select(Collection).where(Collection.id == collection_id).with_for_update()
    )
    collection = result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")

    if collection.collector_id != collector.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cette collecte ne vous appartient pas.")

    if collection.status != CollectionStatus.RESERVEE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cette collecte a déjà été traitée.")

    if collection.validation_code_hash is None or not verify_otp(payload.validation_code, collection.validation_code_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code de validation incorrect.")

    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id).with_for_update())
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot associé introuvable.")

    collection.status = CollectionStatus.VALIDEE
    collection.actual_weight_kg = payload.actual_weight_kg
    collection.validated_at = datetime.now(timezone.utc)
    lot.status = LotStatus.COLLECTE

    await db.flush()
    return collection
