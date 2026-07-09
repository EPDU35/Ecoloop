from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.config.database import get_db

logger = logging.getLogger("ecoloop.auth")
from app.config.settings import settings
from app.controllers import auth_controller
from app.schemas.user_schema import (
    OTPVerifySchema,
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    RefreshTokenSchema,
    TokenPairSchema,
    UserLoginSchema,
    UserOutSchema,
    UserRegisterSchema,
)
from app.utils.helpers import limiter

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.rate_limit_auth)
async def register(request: Request, payload: UserRegisterSchema, db: AsyncSession = Depends(get_db)):
    user, otp_code = await auth_controller.register_user(db, payload)
    await db.commit()
    # En développement : le code OTP est renvoyé dans la réponse pour permettre
    # le test manuel (aucun SMS/email réel n'est envoyé). En production il reste
    # strictement confidentiel et n'est jamais renvoyé au client.
    if settings.debug and not settings.is_production:
        logger.warning("DEV OTP pour %s : %s - NE JAMAIS EXPOSER EN PRODUCTION", payload.email, otp_code)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=UserOutSchema.model_validate(user).model_dump(mode="json"),
        )
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=UserOutSchema.model_validate(user).model_dump(mode="json"),
    )


@router.post("/verify-otp", response_model=UserOutSchema)
@limiter.limit(settings.rate_limit_auth)
async def verify_otp_endpoint(request: Request, payload: OTPVerifySchema, db: AsyncSession = Depends(get_db)):
    user = await auth_controller.verify_registration_otp(db, payload.email, payload.code)
    await db.commit()
    return user


@router.post("/login", response_model=TokenPairSchema)
@limiter.limit(settings.rate_limit_auth)
async def login(request: Request, payload: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    user = await auth_controller.authenticate_user(db, payload)
    access, refresh = auth_controller.issue_token_pair(user)
    await db.commit()
    return TokenPairSchema(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPairSchema)
@limiter.limit(settings.rate_limit_auth)
async def refresh(request: Request, payload: RefreshTokenSchema, db: AsyncSession = Depends(get_db)):
    access, refresh_token = await auth_controller.refresh_access_token(db, payload.refresh_token)
    return TokenPairSchema(access_token=access, refresh_token=refresh_token)


@router.post("/password-reset/request", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(settings.rate_limit_auth)
async def password_reset_request(request: Request, payload: PasswordResetRequestSchema, db: AsyncSession = Depends(get_db)):
    token = await auth_controller.request_password_reset(db, payload)
    await db.commit()
    # TODO intégration réelle : envoyer `token` par email si non None.
    # Réponse toujours identique, que le compte existe ou non (anti-énumération).
    return {"message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."}


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
@limiter.limit(settings.rate_limit_auth)
async def password_reset_confirm(request: Request, payload: PasswordResetConfirmSchema, db: AsyncSession = Depends(get_db)):
    await auth_controller.confirm_password_reset(db, payload)
    await db.commit()
    return {"message": "Mot de passe réinitialisé avec succès."}
