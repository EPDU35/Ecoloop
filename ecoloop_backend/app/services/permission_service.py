from fastapi import HTTPException, status
from app.models.user import User, UserRole


class PermissionService:
    @staticmethod
    def verify_can_resolve_dispute(user: User) -> None:
        if user.role not in [UserRole.ADMIN_ARBITER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul un arbitre certifié (ADMIN_ARBITER) peut résoudre un litige."
            )

    @staticmethod
    def verify_can_validate_payment(user: User) -> None:
        if user.role not in [UserRole.ADMIN, UserRole.ADMIN_ARBITER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Opération réservée au département financier."
            )

    @staticmethod
    def verify_can_manage_system(user: User) -> None:
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès réservé aux administrateurs systèmes."
            )
