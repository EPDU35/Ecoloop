from fastapi import Depends, HTTPException, status

from app.middlewares.jwt import get_current_user
from app.models.user import User, UserRole


def require_roles(*allowed_roles: UserRole):
    """
    Fabrique de dépendance RBAC.

    Usage :
        @router.post("/wastes", dependencies=[Depends(require_roles(UserRole.PRODUCTEUR))])

    Le contrôle se fait strictement côté serveur, sur le rôle stocké en base
    (via le token vérifié), jamais sur une donnée fournie par le client.
    """

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé : rôle insuffisant pour cette action.",
            )
        return current_user

    return dependency


def require_owner_or_roles(get_owner_id, *bypass_roles: UserRole):
    """
    Vérifie que l'utilisateur courant est soit le propriétaire de la ressource
    (ex: son propre lot de déchets), soit un rôle autorisé à outrepasser (ex: admin).

    `get_owner_id` est une fonction (resource) -> uuid.UUID, appelée après
    récupération de la ressource par le contrôleur.
    """

    async def dependency(resource, current_user: User = Depends(get_current_user)):
        owner_id = get_owner_id(resource)
        if current_user.id != owner_id and current_user.role not in bypass_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à cette ressource.",
            )
        return current_user

    return dependency
