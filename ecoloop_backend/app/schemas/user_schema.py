import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.config.security import password_meets_policy
from app.models.user import UserRole

PHONE_REGEX = re.compile(r"^\+?[\d\s\-\(\)]{8,20}$")


class UserRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole
    invitation_token: str | None = None  # Token d'invitation admin (optionnel)

    @field_validator("full_name")
    @classmethod
    def full_name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 150:
            raise ValueError("Le nom complet doit contenir entre 2 et 150 caractères.")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_REGEX.match(v):
            raise ValueError("Numéro de téléphone invalide.")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        ok, message = password_meets_policy(v)
        if not ok:
            raise ValueError(message)
        return v

    @field_validator("role")
    @classmethod
    def role_cannot_be_admin_at_registration(cls, v: UserRole) -> UserRole:
        # Un compte admin ne se crée jamais via l'endpoint public d'inscription (sauf en dev).
        from app.config.settings import settings
        if v == UserRole.ADMIN and settings.is_production:
            raise ValueError("Ce rôle ne peut pas être choisi à l'inscription.")
        return v


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class OTPVerifySchema(BaseModel):
    email: EmailStr
    code: str

    @field_validator("code")
    @classmethod
    def code_format(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("Code OTP invalide.")
        return v


class RefreshTokenSchema(BaseModel):
    refresh_token: str


class PasswordResetRequestSchema(BaseModel):
    email: EmailStr


class PasswordResetConfirmSchema(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        ok, message = password_meets_policy(v)
        if not ok:
            raise ValueError(message)
        return v


class UserOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserUpdateSchema(BaseModel):
    full_name: str | None = None
    phone: str | None = None

    @field_validator("full_name")
    @classmethod
    def full_name_valid(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if len(v) < 2 or len(v) > 150:
                raise ValueError("Le nom complet doit contenir entre 2 et 150 caractères.")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not PHONE_REGEX.match(v):
                raise ValueError("Numéro de téléphone invalide.")
        return v


class TokenPairSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# --- Admin schemas ---
class AdminUserOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime


class AdminUserListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    users: list[AdminUserOutSchema]


class AdminUserValidateSchema(BaseModel):
    """Valider (activer) un compte en attente"""
    pass


class AdminUserRejectSchema(BaseModel):
    """Rejeter (supprimer) un compte en attente"""
    reason: str | None = None


# --- Invitation schemas ---
class InvitationCreateSchema(BaseModel):
    email: EmailStr
    role: UserRole

    @field_validator("role")
    @classmethod
    def role_not_admin(cls, v: UserRole) -> UserRole:
        if v == UserRole.ADMIN:
            raise ValueError("Impossible d'inviter un administrateur.")
        return v


class InvitationBulkCreateSchema(BaseModel):
    invitations: list[InvitationCreateSchema]


class InvitationOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: UserRole
    status: str
    expires_at: datetime
    created_at: datetime


class InvitationAcceptSchema(BaseModel):
    token: str
    full_name: str
    phone: str
    password: str

    @field_validator("full_name")
    @classmethod
    def full_name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 150:
            raise ValueError("Le nom complet doit contenir entre 2 et 150 caractères.")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_REGEX.match(v):
            raise ValueError("Numéro de téléphone invalide.")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        ok, message = password_meets_policy(v)
        if not ok:
            raise ValueError(message)
        return v
