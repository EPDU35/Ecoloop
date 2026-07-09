import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.middlewares.roles import require_roles
from app.models.user import User, UserInvitation, UserRole, InvitationStatus
from app.schemas.user_schema import (
    AdminUserListResponse,
    AdminUserOutSchema,
    AdminUserRejectSchema,
    AdminUserValidateSchema,
    InvitationAcceptSchema,
    InvitationBulkCreateSchema,
    InvitationCreateSchema,
    InvitationOutSchema,
)
from app.services.email_service import email_service

router = APIRouter(prefix="/admin", tags=["Administration - Invitations"])


@router.post(
    "/invitations",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Inviter un professionnel",
)
async def create_invitation(
    payload: InvitationCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Crée une invitation pour un professionnel (Collecteur, Industriel, Mairie)."""
    from app.controllers.invitation_controller import create_invitation

    invitation = await create_invitation(db, admin, payload)
    return {
        "id": str(invitation.id),
        "email": invitation.email,
        "role": invitation.role.value,
        "token": invitation.token,
        "expires_at": invitation.expires_at.isoformat(),
    }


@router.post(
    "/invitations/bulk",
    response_model=list,
    status_code=status.HTTP_201_CREATED,
    summary="Inviter plusieurs professionnels (lot)",
)
async def create_bulk_invitations(
    payload: InvitationBulkCreateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Crée plusieurs invitations en une fois (import Excel/CSV)."""
    from app.controllers.invitation_controller import create_bulk_invitations

    invitations = await create_bulk_invitations(db, admin, payload)
    return [
        {
            "id": str(inv.id),
            "email": inv.email,
            "role": inv.role.value,
            "token": inv.token,
            "expires_at": inv.expires_at.isoformat(),
        }
        for inv in invitations
    ]


@router.get(
    "/invitations",
    summary="Lister les invitations",
)
async def list_invitations(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
    status_filter: Optional[str] = Query(None, description="Filtrer par statut"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    """Liste les invitations envoyées par les admins."""
    query = select(UserInvitation).order_by(UserInvitation.created_at.desc())
    if status_filter:
        try:
            status_enum = InvitationStatus(status_filter.upper())
            query = query.where(UserInvitation.status == status_enum)
        except ValueError:
            pass

    query = query.offset(offset).limit(limit)
    count_query = select(func.count()).select_from(UserInvitation)

    total = await db.execute(count_query)
    results = await db.execute(query)
    invitations = results.scalars().all()

    return {
        "total": total.scalar_one(),
        "limit": limit,
        "offset": offset,
        "invitations": [
            {
                "id": str(inv.id),
                "email": inv.email,
                "role": inv.role.value,
                "status": inv.status.value,
                "invited_by": str(inv.invited_by_id),
                "expires_at": inv.expires_at.isoformat() if inv.expires_at else None,
                "accepted_at": inv.accepted_at.isoformat() if inv.accepted_at else None,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
            }
            for inv in invitations
        ],
    }


@router.post(
    "/users/{user_id}/validate",
    summary="Valider un compte professionnel",
)
async def validate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Valide (active) un compte professionnel en attente."""
    try:
        user_id_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide.")

    result = await db.execute(select(User).where(User.id == user_id_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.is_active:
        raise HTTPException(status_code=400, detail="Ce compte est déjà actif.")

    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de valider un compte administrateur.")

    user.is_active = True
    await db.commit()
    await email_service.send_account_approved_email(user.email, user.full_name)

    return {"status": "validated", "id": str(user.id), "is_active": user.is_active}


@router.post(
    "/users/{user_id}/reject",
    summary="Rejeter (supprimer) un compte professionnel en attente",
)
async def reject_user(
    user_id: str,
    payload: Optional[dict] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Rejette (supprime) un compte professionnel en attente."""
    try:
        user_id_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide.")

    result = await db.execute(select(User).where(User.id == user_id_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.is_active:
        raise HTTPException(status_code=400, detail="Ce compte est déjà actif. Utilisez 'suspend' pour le désactiver.")

    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de rejeter un compte administrateur.")

    reason = payload.get("reason") if payload else None
    email = user.email
    name = user.full_name
    await db.delete(user)
    await db.commit()
    await email_service.send_account_rejected_email(email, name, reason)

    return {"status": "rejected", "id": user_id}


@router.delete(
    "/users/{user_id}",
    summary="Supprimer définitivement un utilisateur (admin seulement)",
)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Supprime définitivement un utilisateur (admin seulement)."""
    try:
        user_id_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Identifiant utilisateur invalide.")

    result = await db.execute(select(User).where(User.id == user_id_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte.")
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Impossible de supprimer un compte administrateur.")

    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "id": user_id}