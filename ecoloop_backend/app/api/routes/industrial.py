from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.controllers.waste_controller import list_available_wastes
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.models.waste import WasteCategory
from app.schemas.waste_schema import WasteLotOutSchema

router = APIRouter(prefix="/industrial", tags=["Industriel"])


@router.get("/marketplace", response_model=list[WasteLotOutSchema])
async def industrial_marketplace(
    category: WasteCategory | None = None,
    min_weight_kg: float = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    industrial: User = Depends(require_roles(UserRole.INDUSTRIEL)),
):
    lots = await list_available_wastes(db, category.value if category else None, limit, offset)
    return [lot for lot in lots if float(lot.weight_kg) >= min_weight_kg]
