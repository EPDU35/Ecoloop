from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.models.collector_location import CollectorLocation
from app.schemas.user_schema import UserOutSchema
from app.schemas.gps_schema import GpsUpdateSchema

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.get("/me", response_model=UserOutSchema)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/gps", status_code=status.HTTP_200_OK)
async def update_gps_location(
    payload: GpsUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    """
    Met à jour ou insère la position GPS actuelle du collecteur.
    """
    stmt = select(CollectorLocation).where(CollectorLocation.collector_id == current_user.id).with_for_update()
    res = await db.execute(stmt)
    loc = res.scalar_one_or_none()
    
    if loc is None:
        loc = CollectorLocation(
            collector_id=current_user.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            accuracy_meters=payload.accuracy_meters
        )
        db.add(loc)
    else:
        loc.latitude = payload.latitude
        loc.longitude = payload.longitude
        loc.accuracy_meters = payload.accuracy_meters
        
    await db.commit()
    return {"status": "success", "message": "Position GPS mise à jour."}
