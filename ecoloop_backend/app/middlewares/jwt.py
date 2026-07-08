import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.security import TokenType, decode_token
from app.models.user import User

# auto_error=False pour renvoyer nous-mêmes un message générique et cohérent
# (ne pas laisser FastAPI exposer les détails internes du schéma de sécurité).
bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Identifiants invalides ou expirés.",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise CREDENTIALS_ERROR

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise CREDENTIALS_ERROR

    # Un refresh token ne doit JAMAIS être accepté comme access token, et inversement.
    if payload.get("type") != TokenType.ACCESS.value:
        raise CREDENTIALS_ERROR

    user_id = payload.get("sub")
    if not user_id:
        raise CREDENTIALS_ERROR

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise CREDENTIALS_ERROR

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise CREDENTIALS_ERROR

    if user.is_locked():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte temporairement verrouillé.",
        )

    return user


async def get_current_verified_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non vérifié. Veuillez confirmer votre email/téléphone.",
        )
    return user
