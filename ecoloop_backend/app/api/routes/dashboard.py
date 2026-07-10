from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
import logging

logger = logging.getLogger(__name__)

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.middlewares.roles import require_roles
from app.models.collection import Collection, CollectionStatus
from app.models.collector_profile import CollectorProfile
from app.models.reward import Reward
from app.models.review import Review
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User, UserRole
from app.models.waste import LotStatus, WasteCategory, WasteLot
from app.services.ai_service import ai_service

from app.utils.helpers import user_cache_key_builder
from fastapi_cache.decorator import cache

router = APIRouter(prefix="/dashboard", tags=["Tableau de bord"])

CO2_PER_KG = 0.65


@router.get("/producer")
@cache(expire=30, key_builder=user_cache_key_builder)
async def producer_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PRODUCTEUR)),
):
    reward = await db.execute(select(Reward).where(Reward.user_id == current_user.id))
    reward = reward.scalar_one_or_none()
    total_kg = reward.total_kg_recycled if reward else 0.0
    points = reward.points if reward else 0
    level = reward.level if reward else "bronze"

    paid_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.net_amount), 0))
        .where(Transaction.producer_id == current_user.id, Transaction.status == TransactionStatus.PAYEE)
    )
    total_revenue = float(paid_result.scalar() or 0)

    collections_result = await db.execute(
        select(func.count())
        .select_from(Collection)
        .join(WasteLot, Collection.waste_lot_id == WasteLot.id)
        .where(WasteLot.producer_id == current_user.id, Collection.status == CollectionStatus.VALIDEE)
    )
    collections_count = collections_result.scalar() or 0

    lots = await db.execute(
        select(WasteLot)
        .where(WasteLot.producer_id == current_user.id)
        .order_by(WasteLot.created_at.desc())
        .limit(10)
    )
    recent_lots = lots.scalars().all()

    co2_avoided = round(total_kg * CO2_PER_KG, 2)

    lots_data = []
    for lot in recent_lots:
        lots_data.append({
            "id": str(lot.id),
            "category": lot.category.value,
            "weight_kg": float(lot.weight_kg),
            "status": lot.status.value,
            "created_at": lot.created_at.isoformat() if lot.created_at else None,
        })

    price_predictions = {}
    for cat in WasteCategory:
        try:
            pred = await ai_service.predict_price(cat.value.lower(), periods=7)
            if pred and pred.get("predictions"):
                price_predictions[cat.value] = pred["predictions"][:7]
        except Exception:
            pass

    return {
        "total_revenue_fcfa": total_revenue,
        "total_kg_recycled": float(total_kg),
        "collections_count": collections_count,
        "level": level,
        "points": points,
        "co2_avoided_kg": co2_avoided,
        "recent_lots": lots_data,
        "price_predictions": price_predictions,
    }


@router.get("/collector")
@cache(expire=30, key_builder=user_cache_key_builder)
async def collector_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    profile = await db.execute(
        select(CollectorProfile).where(CollectorProfile.id == current_user.id)
    )
    profile = profile.scalar_one_or_none()
    reputation = profile.average_rating if profile else 0.0
    completed = profile.completed_collections_count if profile else 0
    total_collections = profile.total_collections_count if profile else 0

    paid_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.net_amount), 0))
        .where(Transaction.collector_id == current_user.id, Transaction.status == TransactionStatus.PAYEE)
    )
    total_earnings = float(paid_result.scalar() or 0)

    available_lots = await db.execute(
        select(WasteLot)
        .where(WasteLot.status == LotStatus.DISPONIBLE)
        .order_by(WasteLot.created_at.desc())
        .limit(20)
    )

    my_collections = await db.execute(
        select(Collection)
        .where(Collection.collector_id == current_user.id)
        .order_by(Collection.reserved_at.desc())
        .limit(10)
    )

    lots_data = []
    for lot in available_lots.scalars().all():
        lots_data.append({
            "id": str(lot.id),
            "category": lot.category.value,
            "description": lot.description,
            "weight_kg": float(lot.weight_kg),
            "price_per_kg": float(lot.price_per_kg),
            "estimated_value": round(float(lot.weight_kg) * float(lot.price_per_kg), 2),
            "latitude": float(lot.latitude),
            "longitude": float(lot.longitude),
            "created_at": lot.created_at.isoformat() if lot.created_at else None,
        })

    collections_data = []
    for col in my_collections.scalars().all():
        collections_data.append({
            "id": str(col.id),
            "waste_lot_id": str(col.waste_lot_id),
            "status": col.status.value,
            "actual_weight_kg": float(col.actual_weight_kg) if col.actual_weight_kg else None,
            "reserved_at": col.reserved_at.isoformat() if col.reserved_at else None,
            "validated_at": col.validated_at.isoformat() if col.validated_at else None,
        })

    return {
        "reputation_score": reputation,
        "completed_collections": completed,
        "total_collections": total_collections,
        "total_earnings_fcfa": total_earnings,
        "available_lots": lots_data,
        "my_collections": collections_data,
    }


@router.get("/industrial")
@cache(expire=30, key_builder=user_cache_key_builder)
async def industrial_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INDUSTRIEL)),
):
    by_category_result = await db.execute(
        select(WasteLot.category, func.coalesce(func.sum(WasteLot.weight_kg), 0))
        .where(WasteLot.status == LotStatus.DISPONIBLE)
        .group_by(WasteLot.category)
    )
    available_by_category = {cat.value: float(w) for cat, w in by_category_result.all()}

    lots = await db.execute(
        select(WasteLot)
        .where(WasteLot.status == LotStatus.DISPONIBLE)
        .order_by(WasteLot.created_at.desc())
        .limit(20)
    )
    lots_data = []
    for lot in lots.scalars().all():
        lots_data.append({
            "id": str(lot.id),
            "category": lot.category.value,
            "description": lot.description,
            "weight_kg": float(lot.weight_kg),
            "price_per_kg": float(lot.price_per_kg),
            "estimated_total": round(float(lot.weight_kg) * float(lot.price_per_kg), 2),
            "latitude": float(lot.latitude),
            "longitude": float(lot.longitude),
            "created_at": lot.created_at.isoformat() if lot.created_at else None,
        })

    top_producers = await db.execute(
        select(User.full_name, func.coalesce(func.sum(WasteLot.weight_kg), 0).label("total_kg"))
        .join(WasteLot, WasteLot.producer_id == User.id)
        .where(WasteLot.status.in_([LotStatus.COLLECTE, LotStatus.DISPONIBLE]))
        .group_by(User.id, User.full_name)
        .order_by(func.coalesce(func.sum(WasteLot.weight_kg), 0).desc())
        .limit(10)
    )

    return {
        "available_by_category_kg": available_by_category,
        "available_lots": lots_data,
        "top_producers": [
            {"name": name, "total_kg_recycled": float(kg)} for name, kg in top_producers.all()
        ],
    }


@router.get("/municipality")
@cache(expire=30, key_builder=user_cache_key_builder)
async def municipality_dashboard(
    db: AsyncSession = Depends(get_db),
    _mairie: User = Depends(require_roles(UserRole.MAIRIE, UserRole.ADMIN)),
):
    total_weight = await db.execute(select(func.coalesce(func.sum(WasteLot.weight_kg), 0)))
    total_weight = float(total_weight.scalar() or 0)

    by_category = await db.execute(
        select(WasteLot.category, func.coalesce(func.sum(WasteLot.weight_kg), 0))
        .group_by(WasteLot.category)
    )
    by_category_data = {cat.value: float(w) for cat, w in by_category.all()}

    paid_amount = await db.execute(
        select(func.coalesce(func.sum(Transaction.gross_amount), 0))
        .where(Transaction.status == TransactionStatus.PAYEE)
    )
    total_paid = float(paid_amount.scalar() or 0)

    users_count = await db.execute(select(func.count()).select_from(User))
    active_users = users_count.scalar() or 0

    collections_validated = await db.execute(
        select(func.count()).select_from(Collection).where(Collection.status == CollectionStatus.VALIDEE)
    )
    validated_count = collections_validated.scalar() or 0

    co2_avoided = round(total_weight * CO2_PER_KG, 2)

    collections_by_day = await db.execute(
        select(
            func.date_trunc("day", Collection.validated_at).label("day"),
            func.count().label("count"),
        )
        .where(
            Collection.status == CollectionStatus.VALIDEE,
            Collection.validated_at >= datetime.now(timezone.utc) - timedelta(days=30),
        )
        .group_by(func.date_trunc("day", Collection.validated_at))
        .order_by(func.date_trunc("day", Collection.validated_at))
    )

    weekly_activity = []
    for day, count in collections_by_day.all():
        weekly_activity.append({
            "date": str(day.date()) if hasattr(day, "date") else str(day),
            "collections": count,
        })

    return {
        "total_weight_kg": total_weight,
        "by_category_kg": by_category_data,
        "total_paid_amount_fcfa": total_paid,
        "active_users": active_users,
        "validated_collections": validated_count,
        "co2_avoided_kg": co2_avoided,
        "weekly_activity": weekly_activity,
        "categories_disponibles": [c.value for c in WasteCategory],
    }
