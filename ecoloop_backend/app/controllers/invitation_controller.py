import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import hash_password
from app.config.settings import settings
from app.models.user import User, UserInvitation, UserRole, InvitationStatus
from app.schemas.user_schema import InvitationCreateSchema, InvitationBulkCreateSchema, InvitationAcceptSchema
from app.services.email_service import email_service


INVITATION_EXPIRY_HOURS = 72  # 3 jours


async def create_invitation(
    db: AsyncSession,
    admin_user: User,
    payload: InvitationCreateSchema,
) -> UserInvitation:
    """Crée une invitation pour un professionnel."""
    # Vérifier si l'email existe déjà en tant qu'utilisateur
    existing_user = await db.execute(select(User).where(User.email == payload.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet email.",
        )

    # Vérifier s'il y a déjà une invitation en attente pour cet email
    existing_invitation = await db.execute(
        select(UserInvitation).where(
            UserInvitation.email == payload.email,
            UserInvitation.status == InvitationStatus.PENDING,
        )
    )
    if existing_invitation.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une invitation est déjà en attente pour cet email.",
        )

    # Générer un token unique
    token = secrets.token_urlsafe(32)

    invitation = UserInvitation(
        email=payload.email,
        role=payload.role,
        invited_by_id=admin_user.id,
        token=token,
        status=InvitationStatus.PENDING,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=INVITATION_EXPIRY_HOURS),
    )
    db.add(invitation)
    await db.flush()

    # Envoyer l'email d'invitation
    invite_link = f"{settings.frontend_url.rstrip('/')}/accepter-invitation?token={token}"
    await email_service.send_invitation_email(payload.email, invite_link, payload.role.value)

    return invitation


async def create_bulk_invitations(
    db: AsyncSession,
    admin_user: User,
    payload: InvitationBulkCreateSchema,
) -> list[UserInvitation]:
    """Crée plusieurs invitations en lot."""
    invitations = []
    for item in payload.invitations:
        try:
            inv = await create_invitation(db, admin_user, item)
            invitations.append(inv)
        except HTTPException as e:
            # On log mais on continue pour les autres
            pass
    return invitations


async def accept_invitation(
    db: AsyncSession,
    payload: InvitationAcceptSchema,
) -> User:
    """Accepte une invitation et crée le compte utilisateur."""
    # Récupérer l'invitation
    result = await db.execute(
        select(UserInvitation).where(
            UserInvitation.token == payload.token,
            UserInvitation.status == InvitationStatus.PENDING,
        )
    )
    invitation = result.scalar_one_or_none()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation invalide ou déjà utilisée.",
        )

    if invitation.expires_at < datetime.now(timezone.utc):
        invitation.status = InvitationStatus.EXPIRED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette invitation a expiré.",
        )

    # Vérifier que l'email n'est pas déjà utilisé
    existing_user = await db.execute(select(User).where(User.email == invitation.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet email.",
        )

    # Créer l'utilisateur
    user = User(
        full_name=payload.full_name,
        email=invitation.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=invitation.role,
        is_active=True,  # Activé directement car invité par admin
        is_verified=True,  # Vérifié car email validé via invitation
    )
    db.add(user)
    await db.flush()

    # Marquer l'invitation comme acceptée
    invitation.status = InvitationStatus.ACCEPTED
    invitation.accepted_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(user)

    return user


async def get_invitations(
    db: AsyncSession,
    status_filter: Optional[InvitationStatus] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[UserInvitation], int]:
    """Récupère la liste des invitations (admin)."""
    query = select(UserInvitation).order_by(UserInvitation.created_at.desc())
    count_query = select(UserInvitation)

    if status_filter:
        query = query.where(UserInvitation.status == status_filter)
        count_query = count_query.where(UserInvitation.status == status_filter)

    total = await db.execute(count_query)
    total_count = total.scalar_one()

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    invitations = result.scalars().all()

    return list(invitations), total_count


async def cancel_invitation(
    db: AsyncSession,
    invitation_id: uuid.UUID,
) -> UserInvitation:
    """Annule une invitation en attente (admin)."""
    result = await db.execute(
        select(UserInvitation).where(UserInvitation.id == invitation_id)
    )
    invitation = result.scalar_one_or_none()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation introuvable.",
        )

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seules les invitations en attente peuvent être annulées.",
        )

    invitation.status = InvitationStatus.CANCELLED
    await db.commit()
    await db.refresh(invitation)
    return invitation