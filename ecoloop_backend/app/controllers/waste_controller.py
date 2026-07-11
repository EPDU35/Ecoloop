import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.waste import LotStatus, WasteLot
from app.schemas.waste_schema import WasteLotCreateSchema, WasteLotUpdateSchema


async def create_waste_lot(db: AsyncSession, producer: User, payload: WasteLotCreateSchema) -> WasteLot:
    lot = WasteLot(
        producer_id=producer.id,
        category=payload.category,
        description=payload.description,
        weight_kg=payload.weight_kg,
        price_per_kg=payload.price_per_kg,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=LotStatus.DISPONIBLE,
    )
    db.add(lot)
    await db.flush()
    return lot


async def get_lot_or_404(db: AsyncSession, lot_id: uuid.UUID) -> WasteLot:
    result = await db.execute(select(WasteLot).where(WasteLot.id == lot_id))
    lot = result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot introuvable.")
    return lot


def ensure_owner(lot: WasteLot, user: User) -> None:
    """
    Vérifie que l'utilisateur courant est bien le propriétaire du lot.
    Appelé avant toute modification/suppression pour empêcher un producteur
    de modifier le lot d'un autre (IDOR).
    """
    if lot.producer_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres lots.",
        )


async def list_available_wastes(db: AsyncSession, category: str | None = None, limit: int = 50, offset: int = 0) -> list[WasteLot]:
    query = select(WasteLot).where(WasteLot.status == LotStatus.DISPONIBLE)
    if category:
        query = query.where(WasteLot.category == category)
    query = query.order_by(WasteLot.created_at.desc()).limit(min(limit, 100)).offset(max(offset, 0))
    result = await db.execute(query)
    return list(result.scalars().all())


async def list_my_wastes(db: AsyncSession, producer: User, limit: int = 50, offset: int = 0) -> list[WasteLot]:
    from app.models.user import UserRole
    query = select(WasteLot).order_by(WasteLot.created_at.desc()).limit(min(limit, 100)).offset(max(offset, 0))

    if producer.role == UserRole.COLLECTEUR:
        query = query.where(WasteLot.collector_id == producer.id)
    elif producer.role in (UserRole.PRODUCTEUR, UserRole.MAIRIE, UserRole.INDUSTRIEL):
        query = query.where(WasteLot.producer_id == producer.id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def update_waste_lot(db: AsyncSession, lot: WasteLot, user: User, payload: WasteLotUpdateSchema) -> WasteLot:
    ensure_owner(lot, user)
    if lot.status != LotStatus.DISPONIBLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Seul un lot disponible (non réservé) peut être modifié.",
        )
    if payload.description is not None:
        lot.description = payload.description
    if payload.weight_kg is not None:
        lot.weight_kg = payload.weight_kg
    if payload.price_per_kg is not None:
        lot.price_per_kg = payload.price_per_kg
    await db.flush()
    return lot


async def delete_waste_lot(db: AsyncSession, lot: WasteLot, user: User) -> None:
    ensure_owner(lot, user)
    if lot.status != LotStatus.DISPONIBLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Seul un lot disponible (non réservé) peut être supprimé.",
        )
    await db.delete(lot)
    await db.flush()


async def attach_photo_url(db: AsyncSession, lot: WasteLot, user: User, photo_url: str) -> WasteLot:
    ensure_owner(lot, user)
    lot.photo_url = photo_url
    await db.flush()
    return lot


async def attach_ai_category(
    db: AsyncSession,
    lot: WasteLot,
    owner: User,
    category: WasteCategory,
) -> WasteLot:
    """
    Affecte à un lot la catégorie de déchet détectée par l'IA.
    Réutilise le check IDOR (`ensure_owner`) pour empêcher un producteur
    de muter le lot d'un tiers via ce chemin.
    """
    ensure_owner(lot, owner)
    lot.category = category
    await db.flush()
    return lot
