import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.controllers import invitation_controller
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole, InvitationStatus
from app.schemas.user_schema import (
    InvitationCreateSchema,
    InvitationBulkCreateSchema,
    InvitationAcceptSchema,
    InvitationOutSchema,
    InvitationStatus as SchemaInvitationStatus,
    AdminUserOutSchema,
    AdminUserListResponse,
    AdminUserValidateSchema,
    AdminUserRejectSchema,
)

router = APIRouter(prefix="/admin", tags=["Administration - Invitations"])


@router.post(
    "/invitations",
    response_model=InvitationOutSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Inviter un professionnel",
)
async def create_invitation(
    payload: InvitationCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Crée une invitation pour un professionnel (Collecteur, Industriel, Mairie)."""
    invitation = await invitation_controller.create_invitation(db, admin, payload)
    await db.commit()
    return invitation


@router.post(
    "/invitations/bulk",
    response_model=list[InvitationOutSchema],
    status_code=status.HTTP_201_CREATED,
    summary="Inviter plusieurs professionnels en lot",
)
async def create_bulk_invitations(
    payload: InvitationBulkCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Crée plusieurs invitations en une fois."""
    invitations = await invitation_controller.create_bulk_invitations(db, admin, payload)
    await db.commit()
    return invitations


@router.get(
    "/invitations",
    summary="Lister les invitations",
)
async def list_invitations(
    status: Optional[SchemaInvitationStatus] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Liste les invitations avec filtres."""
    invitations, total = await invitation_controller.get_invitations(
        db,
        status_filter=InvitationStatus(status.value) if status else None,
        limit=limit,
        offset=offset,
    )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "invitations": invitations,
    }


@router.delete(
    "/invitations/{invitation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Annuler une invitation en attente",
)
async def cancel_invitation(
    invitation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Annule une invitation en attente."""
    await invitation_controller.cancel_invitation(db, invitation_id)
    await db.commit()


# --- Validation/Rejet des comptes (workflow existant) ---

@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="Lister les utilisateurs (admin)",
)
async def admin_list_users(
    role: Optional[UserRole] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Liste paginée des utilisateurs pour l'admin."""
    from app.api.routes.admin import _get_user_or_404  # réutilise la fonction existante
    from sqlalchemy import select, func

    query = select(User).order_by(User.created_at.desc())
    count_query = select(func.count()).select_from(User)

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            (User.full_name.ilike(pattern)) | (User.email.ilike(pattern)) | (User.phone.ilike(pattern))
        )
        count_query = count_query.where(
            (User.full_name.ilike(pattern)) | (User.email.ilike(pattern)) | (User.phone.ilike(pattern))
        )

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    results = await db.execute(query.limit(limit).offset(offset))
    users = results.scalars().all()

    return {
        "total": total,
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
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
    }


@router.patch(
    "/users/{user_id}/validate",
    status_code=status.HTTP_200_OK,
    summary="Valider (activer) un compte professionnel",
)
async def admin_validate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Active un compte professionnel en attente (is_active=True) et notifie par email."""
    from app.services.email_service import email_service
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de valider un administrateur.")

    user.is_active = True
    await db.commit()
    await email_service.send_account_approved_email(user.email, user.full_name)
    return {"status": "validated", "id": str(user.id), "is_active": user.is_active}


@router.patch(
    "/users/{user_id}/reject",
    status_code=status.HTTP_200_OK,
    summary="Rejeter (supprimer) un compte professionnel en attente",
)
async def admin_reject_user(
    user_id: uuid.UUID,
    payload: AdminUserRejectSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Rejette un compte en attente : supprime l'utilisateur et notifie par email."""
    from app.services.email_service import email_service
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de rejeter un administrateur.")

    email = user.email
    name = user.full_name
    reason = payload.reason

    await db.delete(user)
    await db.commit()

    if email:
        await email_service.send_account_rejected_email(email, name, reason)
    return {"status": "rejected", "id": str(user_id)}


@router.patch(
    "/users/{user_id}/suspend",
    status_code=status.HTTP_200_OK,
    summary="Suspendre (désactiver) un compte",
)
async def admin_suspend_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Désactive un compte (is_active=False)."""
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas suspendre votre propre compte.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de suspendre un administrateur.")

    user.is_active = False
    await db.commit()
    return {"status": "suspended", "id": str(user.id), "is_active": user.is_active}