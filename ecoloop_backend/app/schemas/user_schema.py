import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.config.security import password_meets_policy
from app.models.user import UserRole

PHONE_REGEX = re.compile(r"^\+?[0-9]{8,15}$")


class UserRegisterSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole

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
        # Un compte admin ne se crée jamais via l'endpoint public d'inscription.
        if v == UserRole.ADMIN:
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


class TokenPairSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
