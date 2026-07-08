"""
Utilitaires transverses.

RAPPEL DE CONVENTION SÉCURITÉ (voir app/config/database.py) :
- Toujours utiliser l'ORM SQLAlchemy pour construire les requêtes.
- Ne jamais faire `f"SELECT * FROM users WHERE email = '{email}'"`.
- Si une requête brute est indispensable, utiliser `sqlalchemy.text()` avec des
  paramètres nommés bindés : `text("... WHERE email = :email")` + `{"email": email}`.
"""
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config.settings import settings

# Limiteur de débit basé sur l'IP du client. Empêche le brute-force sur les
# endpoints sensibles (login, register, OTP) même en cas de vol du user-agent.
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit_default])


def pagination_params(limit: int = 50, offset: int = 0) -> dict:
    return {"limit": min(max(limit, 1), 100), "offset": max(offset, 0)}


def client_ip(request: Request) -> str:
    """Récupère l'IP réelle du client même derrière un proxy/reverse-proxy de confiance."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
