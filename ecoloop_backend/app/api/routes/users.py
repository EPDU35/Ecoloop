from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.models.user import User
from app.models.collector_location import CollectorLocation
from app.schemas.gps_schema import GpsOutSchema, GpsUpdateSchema
from app.schemas.user_schema import UserOutSchema, UserUpdateSchema

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.get("/me", response_model=UserOutSchema)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOutSchema)
async def update_my_profile(
    payload: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/gps", response_model=GpsOutSchema)
async def update_my_gps(
    payload: GpsUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CollectorLocation).where(CollectorLocation.collector_id == current_user.id)
    )
    location = result.scalar_one_or_none()

    if location is None:
        location = CollectorLocation(
            collector_id=current_user.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            accuracy_meters=payload.accuracy_meters,
        )
        db.add(location)
    else:
        location.latitude = payload.latitude
        location.longitude = payload.longitude
        location.accuracy_meters = payload.accuracy_meters
        location.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(location)
    return location
