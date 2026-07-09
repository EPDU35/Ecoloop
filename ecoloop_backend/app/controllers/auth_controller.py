from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    generate_secure_token,
    hash_otp,
    hash_password,
    hash_token,
    verify_otp,
    verify_password,
)
from app.config.settings import settings
from app.models.reward import Reward
from app.models.user import User, UserRole
from app.schemas.user_schema import (
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    UserLoginSchema,
    UserRegisterSchema,
)

# Message volontairement générique : ne jamais révéler si c'est l'email ou le
# mot de passe qui est incorrect (évite l'énumération de comptes existants).
GENERIC_LOGIN_ERROR = "Email ou mot de passe incorrect."


async def register_user(db: AsyncSession, payload: UserRegisterSchema) -> tuple[User, str]:
    existing = await db.execute(
        select(User).where((User.email == payload.email) | (User.phone == payload.phone))
    )
    if existing.scalar_one_or_none() is not None:
        # Message générique ici aussi : ne pas confirmer si c'est l'email ou le
        # téléphone qui est déjà pris (limite l'énumération de comptes).
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec ces informations.",
        )

    otp_code = generate_otp()
    # OTP bpassé temporairement : le compte est vérifié d'office
    auto_active = payload.role == UserRole.PRODUCTEUR
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=auto_active,
        is_verified=True,  # Bypass OTP
        otp_hash=None,
        otp_expires_at=None,
    )
    db.add(user)
    await db.flush()

    db.add(Reward(user_id=user.id))

    # Le code OTP est renvoyé à la route (et loggé en debug) — il sera transmis
    # au service SMS/email en production.
    return user, otp_code


async def verify_registration_otp(db: AsyncSession, email: str, code: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or user.otp_hash is None or user.otp_expires_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code invalide.")

    otp_expires_at = user.otp_expires_at
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)

    if otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code expiré, demandez-en un nouveau.")

    if not verify_otp(code, user.otp_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code invalide.")

    user.is_verified = True
    user.otp_hash = None
    user.otp_expires_at = None
    await db.flush()
    return user


async def authenticate_user(db: AsyncSession, payload: UserLoginSchema) -> User:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # Même en l'absence de compte, on exécute un verify_password "factice" pour
    # que le temps de réponse ne révèle pas si l'email existe (protection basique
    # contre le timing attack / l'énumération).
    if user is None:
        verify_password(payload.password, "$2b$12$invalidsaltinvalidsaltinvalidsaltinvalidsal")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_LOGIN_ERROR)

    if user.is_locked():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte temporairement verrouillé suite à plusieurs échecs. Réessayez plus tard.",
        )

    # On vérifie le mot de passe AVANT de révéler l'état du compte (verified /
    # actif), pour ne pas divulguer d'information à un tiers non authentifié.
    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.max_login_attempts:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.login_lockout_minutes)
        await db.flush()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_LOGIN_ERROR)

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non vérifié. Consultez votre email pour le code de confirmation.",
        )

    # Producteur : actif après OTP. Pros (Collecteur/Industriel/Mairie) : en
    # attente de validation par un administrateur tant que is_active est False.
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte est en attente de validation par un administrateur. "
                   "Vous recevrez un email dès qu'il sera activé.",
        )

    # Connexion réussie : on réinitialise le compteur d'échecs.
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.flush()
    return user


def issue_token_pair(user: User) -> tuple[str, str]:
    access = create_access_token(str(user.id), user.role.value)
    refresh = create_refresh_token(str(user.id))
    return access, refresh


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide.")

    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalide.")

    # Rotation : un nouveau couple de tokens est émis à chaque refresh,
    # limitant la fenêtre d'exploitation d'un refresh token volé.
    return issue_token_pair(user)


async def request_password_reset(db: AsyncSession, payload: PasswordResetRequestSchema) -> str | None:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # Réponse identique que le compte existe ou non (anti-énumération) :
    # le contrôleur retourne None silencieusement si l'utilisateur n'existe pas,
    # et la route renvoie toujours le même message générique.
    if user is None:
        return None

    token = generate_secure_token()
    user.reset_token_hash = hash_token(token)
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    await db.flush()
    return token


async def confirm_password_reset(db: AsyncSession, payload: PasswordResetConfirmSchema) -> None:
    token_hash = hash_token(payload.token)
    result = await db.execute(select(User).where(User.reset_token_hash == token_hash))
    user = result.scalar_one_or_none()

    if (
        user is None
        or user.reset_token_expires_at is None
        or user.reset_token_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lien de réinitialisation invalide ou expiré.")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.flush()
