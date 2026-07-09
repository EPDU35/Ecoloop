import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.middlewares.jwt import get_current_user
from app.middlewares.roles import require_roles
from app.models.audit_log import AuditLog
from app.models.collection import Collection, CollectionStatus
from app.models.review import Review
from app.models.reward import Reward
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User, UserRole
from app.models.waste import LotStatus, WasteCategory, WasteLot
from app.services.ai_service import ai_service
from app.services.email_service import email_service
from app.services.event_manager import event_manager

logger = logging.getLogger("ecoloop.admin")
router = APIRouter(prefix="/admin", tags=["Administration"])

CO2_PER_KG = 0.65


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    users_count = await db.execute(select(func.count()).select_from(User))
    producers_count = await db.execute(
        select(func.count()).select_from(User).where(User.role == UserRole.PRODUCTEUR)
    )
    collectors_count = await db.execute(
        select(func.count()).select_from(User).where(User.role == UserRole.COLLECTEUR)
    )
    verified_count = await db.execute(
        select(func.count()).select_from(User).where(User.is_verified == True)
    )

    lots_count = await db.execute(select(func.count()).select_from(WasteLot))
    lots_disponible = await db.execute(
        select(func.count()).select_from(WasteLot).where(WasteLot.status == LotStatus.DISPONIBLE)
    )
    lots_collecte = await db.execute(
        select(func.count()).select_from(WasteLot).where(WasteLot.status == LotStatus.COLLECTE)
    )

    collections_count = await db.execute(select(func.count()).select_from(Collection))
    collections_validees = await db.execute(
        select(func.count()).select_from(Collection).where(Collection.status == CollectionStatus.VALIDEE)
    )

    transactions_count = await db.execute(select(func.count()).select_from(Transaction))
    total_revenue = await db.execute(
        select(func.coalesce(func.sum(Transaction.gross_amount), 0))
        .where(Transaction.status == TransactionStatus.PAYEE)
    )

    total_weight = await db.execute(select(func.coalesce(func.sum(WasteLot.weight_kg), 0)))
    total_weight_kg = float(total_weight.scalar_one())

    by_category = await db.execute(
        select(WasteLot.category, func.coalesce(func.sum(WasteLot.weight_kg), 0))
        .group_by(WasteLot.category)
    )

    reviews_count = await db.execute(select(func.count()).select_from(Review))

    ai_healthy = False
    try:
        ai_health = await ai_service.health()
        ai_healthy = ai_health.get("status") == "ok"
    except Exception:
        pass

    return {
        "users": {
            "total": users_count.scalar_one(),
            "producers": producers_count.scalar_one(),
            "collectors": collectors_count.scalar_one(),
            "verified": verified_count.scalar_one(),
        },
        "waste_lots": {
            "total": lots_count.scalar_one(),
            "available": lots_disponible.scalar_one(),
            "collected": lots_collecte.scalar_one(),
        },
        "collections": {
            "total": collections_count.scalar_one(),
            "validated": collections_validees.scalar_one(),
        },
        "transactions": {
            "total": transactions_count.scalar_one(),
            "total_revenue_fcfa": float(total_revenue.scalar_one()),
        },
        "environmental": {
            "total_weight_kg": total_weight_kg,
            "co2_avoided_kg": round(total_weight_kg * CO2_PER_KG, 2),
            "by_category_kg": {cat.value: float(w) for cat, w in by_category.all()},
        },
        "reviews_count": reviews_count.scalar_one(),
        "ai_healthy": ai_healthy,
    }


@router.get("/users")
async def admin_users(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    role: str = Query(default=None),
    search: str = Query(default=None),
):
    query = select(User).order_by(User.created_at.desc())
    count_query = select(func.count()).select_from(User)

    if role:
        try:
            role_enum = UserRole(role.upper())
            query = query.where(User.role == role_enum)
            count_query = count_query.where(User.role == role_enum)
        except ValueError:
            pass
    if search:
        pattern = f"%{search}%"
        query = query.where(
            User.full_name.ilike(pattern) | User.email.ilike(pattern) | User.phone.ilike(pattern)
        )
        count_query = count_query.where(
            User.full_name.ilike(pattern) | User.email.ilike(pattern) | User.phone.ilike(pattern)
        )

    total = await db.execute(count_query)
    results = await db.execute(query.offset(offset).limit(limit))
    users = results.scalars().all()

    return {
        "total": total.scalar_one(),
        "limit": limit,
        "offset": offset,
        "users": [
            {
                "id": str(u.id),
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "role": u.role.value,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "is_locked": u.is_locked(),
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
    }


async def _get_user_or_404(db: AsyncSession, user_id: str) -> User:
    try:
        uid = uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide.")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return user


@router.patch("/users/{user_id}/validate")
async def admin_validate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Valide (active) un compte professionnel en attente et notifie par email."""
    user = await _get_user_or_404(db, user_id)
    user.is_active = True
    await db.commit()
    await email_service.send_account_approved_email(user.email, user.full_name)
    logger.info("Compte validé par admin : %s (%s)", user.email, user.role.value)
    return {"status": "validated", "id": str(user.id), "is_active": user.is_active}


@router.patch("/users/{user_id}/reject")
async def admin_reject_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Rejette (supprime) un compte professionnel en attente et notifie par email."""
    user = await _get_user_or_404(db, user_id)
    if user.is_active:
        raise HTTPException(status_code=400, detail="Ce compte est déjà actif. Utilisez 'suspend' pour le désactiver.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de rejeter un compte administrateur.")
    email = user.email
    name = user.full_name
    await db.delete(user)
    await db.commit()
    await email_service.send_account_rejected_email(email, name)
    logger.info("Compte rejeté par admin : %s (%s)", email, user.role.value)
    return {"status": "rejected", "id": user_id}


@router.patch("/users/{user_id}/suspend")
async def admin_suspend_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Suspend (désactive) un compte utilisateur."""
    user = await _get_user_or_404(db, user_id)
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas suspendre votre propre compte.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de suspendre un compte administrateur.")
    user.is_active = False
    await db.commit()
    logger.info("Compte suspendu par admin : %s", user.email)
    return {"status": "suspended", "id": str(user.id), "is_active": user.is_active}


@router.get("/collections")
async def admin_collections(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    status: str = Query(default=None),
):
    query = (
        select(
            Collection.id,
            Collection.status,
            Collection.actual_weight_kg,
            Collection.reserved_at,
            Collection.validated_at,
            WasteLot.category,
            WasteLot.weight_kg.label("estimated_weight"),
            User.full_name.label("collector_name"),
        )
        .join(WasteLot, Collection.waste_lot_id == WasteLot.id)
        .join(User, Collection.collector_id == User.id)
        .order_by(Collection.reserved_at.desc())
    )
    count_query = select(func.count()).select_from(Collection)

    if status:
        try:
            s = CollectionStatus(status.upper())
            query = query.where(Collection.status == s)
            count_query = count_query.where(Collection.status == s)
        except ValueError:
            pass

    total = await db.execute(count_query)
    results = await db.execute(query.offset(offset).limit(limit))
    rows = results.all()

    return {
        "total": total.scalar_one(),
        "limit": limit,
        "offset": offset,
        "collections": [
            {
                "id": str(r.id),
                "status": r.status.value,
                "category": r.category.value if r.category else None,
                "actual_weight_kg": float(r.actual_weight_kg) if r.actual_weight_kg else None,
                "estimated_weight_kg": float(r.estimated_weight) if r.estimated_weight else None,
                "collector_name": r.collector_name,
                "reserved_at": r.reserved_at.isoformat() if r.reserved_at else None,
                "validated_at": r.validated_at.isoformat() if r.validated_at else None,
            }
            for r in rows
        ],
    }


@router.get("/transactions")
async def admin_transactions(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    status: str = Query(default=None),
):
    query = (
        select(
            Transaction.id,
            Transaction.gross_amount,
            Transaction.commission_amount,
            Transaction.net_amount,
            Transaction.payment_method,
            Transaction.status,
            Transaction.external_reference,
            Transaction.created_at,
            Transaction.paid_at,
            User.full_name.label("producer_name"),
        )
        .join(User, Transaction.producer_id == User.id)
        .order_by(Transaction.created_at.desc())
    )
    count_query = select(func.count()).select_from(Transaction)

    if status:
        try:
            s = TransactionStatus(status.upper())
            query = query.where(Transaction.status == s)
            count_query = count_query.where(Transaction.status == s)
        except ValueError:
            pass

    total = await db.execute(count_query)
    results = await db.execute(query.offset(offset).limit(limit))
    rows = results.all()

    return {
        "total": total.scalar_one(),
        "limit": limit,
        "offset": offset,
        "transactions": [
            {
                "id": str(r.id),
                "gross_amount": float(r.gross_amount),
                "commission_amount": float(r.commission_amount),
                "net_amount": float(r.net_amount),
                "payment_method": r.payment_method.value,
                "status": r.status.value,
                "external_reference": r.external_reference,
                "producer_name": r.producer_name,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "paid_at": r.paid_at.isoformat() if r.paid_at else None,
            }
            for r in rows
        ],
    }


@router.get("/audit-log")
async def admin_audit_log(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = (
        select(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    count_query = select(func.count()).select_from(AuditLog)
    total = await db.execute(count_query)
    results = await db.execute(query)
    rows = results.all()

    return {
        "total": total.scalar_one(),
        "limit": limit,
        "offset": offset,
        "entries": [
            {
                "id": str(r[0].id),
                "user_name": r[1] if r[1] else "System",
                "action": r[0].action,
                "entity_type": r[0].entity_type,
                "entity_id": str(r[0].entity_id),
                "created_at": r[0].created_at.isoformat() if r[0].created_at else None,
            }
            for r in rows
        ],
    }


@router.get("/activity")
async def admin_activity(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
    limit: int = Query(default=20, ge=1, le=50),
):
    events = []
    users_recent = await db.execute(
        select(User.full_name, User.role, User.created_at)
        .order_by(User.created_at.desc())
        .limit(5)
    )
    for u in users_recent.all():
        events.append({
            "type": "user_registered",
            "description": f"{u.full_name} ({u.role.value})",
            "timestamp": u.created_at.isoformat() if u.created_at else None,
        })

    cols_recent = await db.execute(
        select(Collection.status, Collection.reserved_at, Collection.validated_at)
        .order_by(Collection.reserved_at.desc())
        .limit(5)
    )
    for c in cols_recent.all():
        ts = c.validated_at if c.validated_at else c.reserved_at
        events.append({
            "type": f"collection_{c.status.value.lower()}",
            "description": f"Collection {c.status.value.lower()}",
            "timestamp": ts.isoformat() if ts else None,
        })

    events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
    return {"events": events[:limit]}


@router.get("/system")
async def admin_system(
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    db_ok = False
    try:
        from app.config.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.warning("DB health check failed: %s", e)

    redis_ok = False
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.redis_url, socket_connect_timeout=3)
        await r.ping()
        redis_ok = True
        await r.aclose()
    except Exception:
        pass

    ai_healthy = False
    ai_models = {}
    try:
        health = await ai_service.health()
        ai_healthy = health.get("status") == "ok"
        ai_models = health.get("models_loaded", {})
    except Exception:
        pass

    return {
        "database": {"status": "healthy" if db_ok else "unhealthy"},
        "redis": {"status": "healthy" if redis_ok else "unhealthy"},
        "ai_service": {
            "status": "healthy" if ai_healthy else "unhealthy",
            "models_loaded": ai_models,
        },
        "environment": settings.environment,
        "api_version": "1.0.0",
    }


@router.get("/events")
async def admin_events(
    request: Request,
    _admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    async def event_generator():
        q = event_manager.subscribe()
        try:
            for event in event_manager.get_recent(10):
                yield f"data: {json.dumps(event, default=str)}\n\n"

            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=30.0)
                    yield f"data: {json.dumps(event, default=str)}\n\n"
                except asyncio.TimeoutError:
                    yield f": keepalive\n\n"
                except asyncio.CancelledError:
                    break
        finally:
            event_manager.unsubscribe(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
