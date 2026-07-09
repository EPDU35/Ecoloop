"""
EcoLoop AI - Middleware d'Authentification JWT
================================================

Middleware de sécurité pour l'authentification par JSON Web Token (JWT).
Vérifie la présence et la validité du token dans le header Authorization.

Utilisation :
- Le client doit envoyer le header : Authorization: Bearer <token>
- Le token est décodé avec l'algorithme HS256
- La clé secrète est configurée via la variable d'environnement JWT_SECRET

Configuration :
- Variable d'environnement : JWT_SECRET (clé secrète pour la signature JWT)
- Algorithme : HS256
- Les endpoints exemptés (health check, docs) ne nécessitent pas d'authentification
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# --- Configuration du logging ---
logger = logging.getLogger("ecoloop_ai.auth")

# --- Configuration JWT ---
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

# --- Endpoints exemptés d'authentification ---
EXEMPT_PATHS = {
    "/api/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/",
}

# --- Schéma de sécurité HTTP Bearer ---
security_scheme = HTTPBearer(auto_error=False)


async def verify_token(request: Request) -> Optional[dict]:
    """
    Vérifie et décode le token JWT présent dans le header Authorization.
    
    Cette fonction est conçue pour être utilisée comme dépendance FastAPI
    (Depends) sur les endpoints nécessitant une authentification.
    
    Processus de vérification :
    1. Vérifie la présence du header Authorization
    2. Valide le format "Bearer <token>"
    3. Décode le token avec la clé secrète et l'algorithme HS256
    4. Vérifie l'expiration du token
    5. Retourne le payload décodé
    
    Paramètres :
    - request : objet Request de FastAPI contenant les headers HTTP
    
    Retourne :
    - dict : payload décodé du token JWT (contient les claims)
    
    Exceptions :
    - HTTPException 401 : token manquant, expiré ou invalide
    
    Exemple d'utilisation :
    ```python
    @app.get("/api/protected")
    async def protected_endpoint(
        payload: dict = Depends(verify_token)
    ):
        user_id = payload.get("sub")
        return {"message": f"Bienvenue, utilisateur {user_id}"}
    ```
    """
    # --- Vérifier si le chemin est exempté ---
    if request.url.path in EXEMPT_PATHS:
        logger.debug(f"Chemin exempté d'authentification : {request.url.path}")
        return None

    # --- Récupérer le header Authorization ---
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        logger.warning(
            f"Token manquant pour la requête : {request.method} {request.url.path}"
        )
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token manquant",
                "message": (
                    "Le header Authorization est requis. "
                    "Format attendu : 'Bearer <votre_token>'"
                ),
                "code": "TOKEN_MISSING"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    # --- Valider le format Bearer ---
    parts = auth_header.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        logger.warning(
            f"Format d'autorisation invalide : {auth_header[:50]}..."
        )
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Format invalide",
                "message": (
                    "Le format du header Authorization est invalide. "
                    "Format attendu : 'Bearer <votre_token>'"
                ),
                "code": "TOKEN_INVALID_FORMAT"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = parts[1]

    # --- Décoder et vérifier le token ---
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={
                "verify_exp": True,
                "verify_iat": True,
                "require": ["exp", "sub"]
            }
        )

        logger.info(
            f"Token validé avec succès pour l'utilisateur : "
            f"{payload.get('sub', 'inconnu')}"
        )

        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("Token expiré reçu")
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token expiré",
                "message": (
                    "Votre token d'authentification a expiré. "
                    "Veuillez vous reconnecter pour obtenir un nouveau token."
                ),
                "code": "TOKEN_EXPIRED"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    except jwt.InvalidSignatureError:
        logger.warning("Token avec signature invalide reçu")
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token invalide",
                "message": (
                    "La signature du token est invalide. "
                    "Le token a peut-être été altéré."
                ),
                "code": "TOKEN_INVALID_SIGNATURE"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    except jwt.DecodeError:
        logger.warning("Token non décodable reçu")
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token invalide",
                "message": (
                    "Le token ne peut pas être décodé. "
                    "Vérifiez que le token est un JWT valide."
                ),
                "code": "TOKEN_DECODE_ERROR"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    except jwt.MissingRequiredClaimError as e:
        logger.warning(f"Claim requis manquant dans le token : {e}")
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token incomplet",
                "message": (
                    f"Le token ne contient pas tous les claims requis : {str(e)}"
                ),
                "code": "TOKEN_MISSING_CLAIM"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    except jwt.InvalidTokenError as e:
        logger.warning(f"Token invalide : {e}")
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Token invalide",
                "message": f"Le token d'authentification est invalide : {str(e)}",
                "code": "TOKEN_INVALID"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(request: Request) -> dict:
    """
    Dépendance FastAPI pour récupérer l'utilisateur courant.
    
    Vérifie le token et retourne les informations de l'utilisateur
    extraites du payload JWT.
    
    Paramètres :
    - request : objet Request de FastAPI
    
    Retourne :
    - dict : informations de l'utilisateur avec les clés :
        - user_id : identifiant de l'utilisateur (claim 'sub')
        - email : email de l'utilisateur (si présent)
        - role : rôle de l'utilisateur (si présent)
        - payload : payload JWT complet
    
    Exemple d'utilisation :
    ```python
    @app.get("/api/profile")
    async def get_profile(
        user: dict = Depends(get_current_user)
    ):
        return {"user_id": user["user_id"], "email": user.get("email")}
    ```
    """
    payload = await verify_token(request)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail={
                "erreur": "Authentification requise",
                "message": "Vous devez être authentifié pour accéder à cette ressource.",
                "code": "AUTH_REQUIRED"
            }
        )

    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role", "user"),
        "payload": payload
    }


def create_token_for_testing(
    user_id: str,
    email: str = "test@ecoloop.ai",
    role: str = "user",
    expires_in_seconds: int = 3600
) -> str:
    """
    Crée un token JWT pour les tests (NE PAS utiliser en production).
    
    Cette fonction est fournie uniquement pour faciliter les tests
    de développement. En production, les tokens doivent être générés
    par le service d'authentification principal.
    
    Paramètres :
    - user_id : identifiant de l'utilisateur
    - email : adresse email
    - role : rôle de l'utilisateur
    - expires_in_seconds : durée de validité en secondes (défaut : 1h)
    
    Retourne :
    - str : token JWT encodé
    """
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in_seconds),
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    logger.debug(f"Token de test créé pour l'utilisateur : {user_id}")

    return token
