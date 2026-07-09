import logging
import os
import asyncio
import httpx

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

from app.api.routes import (
    admin,
    admin_invitations,
    ai,
    auth,
    collections,
    dashboard,
    industrial,
    municipality,
    notifications,
    payments,
    push,
    reviews,
    rewards,
    transactions,
    users,
    wastes,
)
from app.config.settings import settings
from app.services.ai_service import ai_service
from app.services.event_manager import event_manager
from app.utils.helpers import limiter

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("ecoloop")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# --- Rate limiting global ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS : doit être le premier middleware (outermost) pour gérer les preflight ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|https?://.*\.vercel\.app|https?://.*\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Hôtes de confiance ---
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list if settings.is_production else ["*"],
)

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """En-têtes de sécurité HTTP appliqués à toutes les réponses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors()}),
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder({"detail": exc.detail}),
        headers=exc.headers,
    )

@app.on_event("shutdown")
async def shutdown_event():
    await ai_service.close()

async def keep_alive_task():
    url = os.environ.get("RENDER_EXTERNAL_URL")
    if not url:
        return
    ping_url = f"{url.rstrip('/')}/health"
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(14 * 60)
            try:
                await client.get(ping_url)
                logger.info("Keep-alive ping sent successfully")
            except Exception as e:
                logger.warning(f"Keep-alive ping failed: {e}")

@app.on_event("startup")
async def startup_event():
    redis = aioredis.from_url(settings.redis_url, encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    if os.environ.get("RENDER_EXTERNAL_URL"):
        asyncio.create_task(keep_alive_task())

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Erreur non gérée sur %s %s", request.method, request.url.path)
    origin = request.headers.get("origin")
    headers = {"Access-Control-Allow-Origin": origin} if origin else {}
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=jsonable_encoder({"detail": "Une erreur interne est survenue. Réessayez plus tard."}),
        headers=headers,
    )


# --- Routes ---
prefix = settings.api_v1_prefix
app.include_router(admin.router, prefix=prefix)
app.include_router(admin_invitations.router, prefix=prefix)
app.include_router(auth.router, prefix=prefix)
app.include_router(users.router, prefix=prefix)
app.include_router(wastes.router, prefix=prefix)
app.include_router(collections.router, prefix=prefix)
app.include_router(dashboard.router, prefix=prefix)
app.include_router(transactions.router, prefix=prefix)
app.include_router(payments.router, prefix=prefix)
app.include_router(industrial.router, prefix=prefix)
app.include_router(municipality.router, prefix=prefix)
app.include_router(notifications.router, prefix=prefix)
app.include_router(reviews.router, prefix=prefix)
app.include_router(rewards.router, prefix=prefix)
app.include_router(push.router, prefix=prefix)
app.include_router(ai.router)


@app.get("/health", tags=["Système"])
async def health_check():
    return {"status": "ok", "environment": settings.environment}
