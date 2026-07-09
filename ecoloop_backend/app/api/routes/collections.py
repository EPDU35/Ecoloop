import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.controllers import collection_controller
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.schemas.waste_schema import CollectionOutSchema, CollectionReserveSchema, CollectionValidateSchema
from app.services.notification_service import (
    notify_collection_reserved,
    notify_collection_validated,
    notify_validation_code,
)

router = APIRouter(tags=["Collectes"])


@router.post("/reserve", response_model=CollectionOutSchema, status_code=status.HTTP_201_CREATED)
async def reserve(
    payload: CollectionReserveSchema,
    db: AsyncSession = Depends(get_db),
    collector: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    collection, validation_code, producer_id = await collection_controller.reserve_lot(
        db, collector, payload.waste_lot_id
    )
    await db.commit()
    await notify_collection_reserved(db, producer_id, collection.id)
    await notify_validation_code(db, producer_id, validation_code)
    return collection


@router.post("/validate-collection/{collection_id}", response_model=CollectionOutSchema)
async def validate_collection(
    collection_id: uuid.UUID,
    payload: CollectionValidateSchema,
    db: AsyncSession = Depends(get_db),
    collector: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    collection = await collection_controller.validate_collection(db, collector, collection_id, payload)
    await db.commit()
    await notify_collection_validated(db, collector.id, collection_id)
    return collection
