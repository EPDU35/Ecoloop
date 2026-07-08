import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import generate_otp, hash_otp, verify_otp
from app.models.collection import Collection, CollectionStatus
from app.models.user import User, UserRole
from app.models.waste import LotStatus, WasteLot
from app.models.collector_profile import CollectorProfile, CollectorStatus
from app.schemas.waste_schema import CollectionValidateSchema


async def reserve_lot(db: AsyncSession, collector: User, waste_lot_id) -> tuple[Collection, str, "uuid.UUID"]:
    """
    Réservation atomique d'un lot.

    RÈGLE DE SÉCURITÉ / INTÉGRITÉ : verrouillage pessimiste (SELECT ... FOR UPDATE)
    pour empêcher deux collecteurs de réserver le même lot simultanément
    (condition de course classique sur les marketplaces).
    """
    # 1. Vérifier si le collecteur est autorisé (profil vérifié)
    profile_result = await db.execute(
        select(CollectorProfile).where(CollectorProfile.id == collector.id).with_for_update()
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profil collecteur introuvable.")

    from app.models.collector_profile import VerificationStatus
    if profile.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Votre profil collecteur n'est pas encore vérifié.")

    if profile.status != CollectorStatus.AVAILABLE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vous êtes déjà occupé ou hors-ligne.")

    # 2. Réserver le lot
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

    # Vérification capacité
    if profile.vehicle_capacity_kg < float(lot.weight_kg):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La capacité de votre véhicule est insuffisante.")

    lot.status = LotStatus.RESERVE
    lot.collector_id = collector.id

    validation_code = generate_otp(6)
    collection = Collection(
        waste_lot_id=lot.id,
        collector_id=collector.id,
        status=CollectionStatus.RESERVEE,
        validation_code_hash=hash_otp(validation_code),
        estimated_weight_kg=lot.weight_kg,
    )
    db.add(collection)

    # Passer le collecteur en BUSY et incrémenter total_collections
    profile.status = CollectorStatus.BUSY
    profile.total_collections_count += 1

    await db.flush()

    # Le code de validation en clair est renvoyé une seule fois à l'appelant
    return collection, validation_code, lot.producer_id


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
    collection.weight_verified_by = UserRole.COLLECTEUR
    collection.weight_verified_at = datetime.now(timezone.utc)
    collection.validated_at = datetime.now(timezone.utc)
    
    lot.status = LotStatus.COLLECTE

    # Repasser le collecteur en AVAILABLE et incrémenter completed_collections
    profile_result = await db.execute(
        select(CollectorProfile).where(CollectorProfile.id == collector.id).with_for_update()
    )
    profile = profile_result.scalar_one_or_none()
    if profile:
        profile.status = CollectorStatus.AVAILABLE
        profile.completed_collections_count += 1

    await db.flush()
    return collection


async def cancel_collection(db: AsyncSession, user: User, collection_id: uuid.UUID) -> Collection:
    result = await db.execute(
        select(Collection).where(Collection.id == collection_id).with_for_update()
    )
    collection = result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")

    if collection.status in (CollectionStatus.VALIDEE, CollectionStatus.ANNULEE):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cette collecte ne peut plus être annulée.")

    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id).with_for_update())
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot associé introuvable.")

    # Seuls le producteur ou le collecteur peuvent annuler
    if user.id not in (lot.producer_id, collection.collector_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Action non autorisée sur cette collecte.")

    collection.status = CollectionStatus.ANNULEE
    lot.status = LotStatus.DISPONIBLE
    lot.collector_id = None

    # Repasser le collecteur en AVAILABLE
    profile_result = await db.execute(
        select(CollectorProfile).where(CollectorProfile.id == collection.collector_id).with_for_update()
    )
    profile = profile_result.scalar_one_or_none()
    if profile:
        profile.status = CollectorStatus.AVAILABLE

    await db.flush()
    return collection
