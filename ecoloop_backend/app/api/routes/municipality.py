from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.middlewares.roles import require_roles
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User, UserRole
from app.models.waste import WasteCategory, WasteLot

router = APIRouter(prefix="/municipality", tags=["Mairie"])


@router.get("/impact")
async def impact_summary(
    db: AsyncSession = Depends(get_db),
    _mairie: User = Depends(require_roles(UserRole.MAIRIE, UserRole.ADMIN)),
):
    """
    Statistiques agrégées uniquement (aucune donnée nominative individuelle
    n'est exposée à ce rôle, conformément au principe de minimisation des données).
    """
    total_weight_result = await db.execute(select(func.coalesce(func.sum(WasteLot.weight_kg), 0)))
    total_weight = total_weight_result.scalar_one()

    by_category_result = await db.execute(
        select(WasteLot.category, func.coalesce(func.sum(WasteLot.weight_kg), 0))
        .group_by(WasteLot.category)
    )
    by_category = {category.value: float(weight) for category, weight in by_category_result.all()}

    paid_amount_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.gross_amount), 0)).where(Transaction.status == TransactionStatus.PAYEE)
    )
    total_paid_amount = paid_amount_result.scalar_one()

    return {
        "total_weight_kg": float(total_weight),
        "by_category_kg": by_category,
        "total_paid_amount_fcfa": float(total_paid_amount),
        "categories_disponibles": [c.value for c in WasteCategory],
    }
