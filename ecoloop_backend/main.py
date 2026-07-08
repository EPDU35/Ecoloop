import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import (
    auth,
    collections,
    industrial,
    municipality,
    payments,
    transactions,
    users,
    wastes,
)
from app.config.settings import settings
from app.utils.helpers import limiter

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("ecoloop")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    # En production, la doc interactive n'est exposée qu'aux environnements
    # non publics — évite de cartographier toute l'API à un attaquant.
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# --- Rate limiting global ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Hôtes de confiance : rejette toute requête avec un en-tête Host inattendu ---
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts_list or ["*"])

# --- CORS strict : uniquement les origines explicitement listées ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """En-têtes de sécurité HTTP appliqués à toutes les réponses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# --- Gestion d'erreurs uniforme : jamais de stack trace ni de détail interne au client ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Les messages de validation Pydantic sont sûrs à renvoyer (ils décrivent le
    # format attendu, pas l'état interne du serveur).
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Erreur non gérée sur %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Une erreur interne est survenue. Réessayez plus tard."},
    )


# --- Routes ---
prefix = settings.api_v1_prefix
app.include_router(auth.router, prefix=prefix)
app.include_router(users.router, prefix=prefix)
app.include_router(wastes.router, prefix=prefix)
app.include_router(collections.router, prefix=prefix)
app.include_router(transactions.router, prefix=prefix)
app.include_router(payments.router, prefix=prefix)
app.include_router(industrial.router, prefix=prefix)
app.include_router(municipality.router, prefix=prefix)


@app.get("/health", tags=["Système"])
async def health_check():
    return {"status": "ok", "environment": settings.environment}
