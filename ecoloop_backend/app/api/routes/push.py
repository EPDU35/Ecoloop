import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.models.user import User
from app.models.device_token import DeviceToken
from pydantic import BaseModel

router = APIRouter(tags=["Push Notifications"])


class RegisterDeviceTokenRequest(BaseModel):
    token: str
    platform: str | None = None


@router.post("/push/register", status_code=status.HTTP_201_CREATED)
async def register_device_token(
    payload: RegisterDeviceTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeviceToken).where(
            DeviceToken.user_id == current_user.id,
            DeviceToken.token == payload.token,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.is_active = True
        await db.flush()
        await db.commit()
        return {"status": "updated"}

    device_token = DeviceToken(
        user_id=current_user.id,
        token=payload.token,
        platform=payload.platform,
    )
    db.add(device_token)
    await db.flush()
    await db.commit()
    return {"status": "registered"}


@router.delete("/push/unregister")
async def unregister_device_token(
    token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeviceToken).where(
            DeviceToken.user_id == current_user.id,
            DeviceToken.token == token,
        )
    )
    device_token = result.scalar_one_or_none()
    if device_token:
        device_token.is_active = False
        await db.flush()
        await db.commit()
    return {"status": "unregistered"}
