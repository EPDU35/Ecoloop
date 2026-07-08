"""
Primitives cryptographiques centralisées.

- Mots de passe : bcrypt (via passlib), jamais stockés en clair, jamais loggés.
- JWT : access token court (15 min par défaut) + refresh token long, stocké côté
  serveur sous forme hashée pour permettre la révocation.
- OTP : code numérique à usage unique, hashé en base, expiration courte.
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


# ---------------------------------------------------------------------------
# Mots de passe
# ---------------------------------------------------------------------------

def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Hash corrompu ou format inattendu : on refuse plutôt que de lever une 500.
        return False


def password_meets_policy(password: str) -> tuple[bool, str]:
    """
    Politique de mot de passe minimale mais réelle :
    longueur, majuscule, minuscule, chiffre. Le détail de la règle violée
    est renvoyé pour l'UX, jamais pour du débogage serveur.
    """
    if len(password) < settings.password_min_length:
        return False, f"Le mot de passe doit contenir au moins {settings.password_min_length} caractères."
    if not any(c.isupper() for c in password):
        return False, "Le mot de passe doit contenir au moins une majuscule."
    if not any(c.islower() for c in password):
        return False, "Le mot de passe doit contenir au moins une minuscule."
    if not any(c.isdigit() for c in password):
        return False, "Le mot de passe doit contenir au moins un chiffre."
    return True, ""


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta, extra_claims: dict | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type.value,
        "iat": now,
        "exp": now + expires_delta,
        "jti": str(uuid.uuid4()),  # identifiant unique -> permet la révocation ciblée
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str, role: str) -> str:
    return _create_token(
        subject=user_id,
        token_type=TokenType.ACCESS,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        subject=user_id,
        token_type=TokenType.REFRESH,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None


def hash_token(token: str) -> str:
    """Utilisé pour stocker les refresh tokens en base sans jamais garder la valeur brute."""
    return hashlib.sha256(token.encode()).hexdigest()


# ---------------------------------------------------------------------------
# OTP (vérification téléphone / email)
# ---------------------------------------------------------------------------

def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def verify_otp(code: str, hashed: str) -> bool:
    return secrets.compare_digest(hash_otp(code), hashed)


# ---------------------------------------------------------------------------
# Divers
# ---------------------------------------------------------------------------

def generate_secure_token(nbytes: int = 32) -> str:
    """Pour les liens de réinitialisation de mot de passe, etc."""
    return secrets.token_urlsafe(nbytes)
