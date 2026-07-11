from typing import List
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.controllers import report_controller
from app.middlewares.jwt import get_current_verified_user
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.schemas.report_schema import IllegalDumpReportCreate, IllegalDumpReportOut, IllegalDumpValidationStatus

router = APIRouter(prefix="/reports", tags=["Signalements (Dépôts Sauvages)"])


@router.post("/", response_model=IllegalDumpReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    payload: IllegalDumpReportCreate,
    current_user: User = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """Signaler un nouveau dépôt sauvage (ouvert à tous les utilisateurs vérifiés)."""
    return await report_controller.create_report(db, payload, current_user.id)


@router.get("/", response_model=List[IllegalDumpReportOut])
async def list_reports(
    current_user: User = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lister les signalements.
    Les admins et les mairies voient tous les signalements.
    Les autres ne voient que leurs propres signalements.
    """
    if current_user.role in [UserRole.ADMIN, UserRole.MAIRIE]:
        return await report_controller.get_all_reports(db)
    else:
        return await report_controller.get_user_reports(db, current_user.id)


@router.post("/{report_id}/validate", response_model=IllegalDumpReportOut)
async def validate_report(
    report_id: uuid.UUID,
    payload: IllegalDumpValidationStatus,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MAIRIE])),
    db: AsyncSession = Depends(get_db)
):
    """
    Valider, rejeter ou marquer comme nettoyé un dépôt sauvage (Admin/Mairie).
    Permet également d'attribuer des points de récompense.
    """
    return await report_controller.validate_report(db, report_id, payload, current_user)
