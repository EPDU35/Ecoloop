import uuid
from datetime import datetime, timezone
from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.illegal_dump import IllegalDumpReport, ReportStatus
from app.models.reward import Reward
from app.models.reward_transaction import RewardTransaction, RewardAction
from app.models.user import User, UserRole
from app.schemas.report_schema import IllegalDumpReportCreate, IllegalDumpValidationStatus
from app.services.ai_service import ai_service


async def create_report(
    db: AsyncSession, payload: IllegalDumpReportCreate, user_id: uuid.UUID
) -> IllegalDumpReport:
    """Create a new illegal dump report with optional AI classification/fraud check."""
    
    # 1. Évaluation du risque de fraude (Heuristique MVP)
    # Note (VIBEATHON): Le modèle Isolation Forest actuel (V1) est entraîné 
    # sur les transactions (poids, prix_kg). Il n'est pas pertinent pour les 
    # dépôts sauvages (sans prix, basé sur volume m3 et géolocalisation).
    # L'intégration d'un modèle de fraude spécifique aux signalements (V2) 
    # est prévue sur la roadmap. En attendant, on utilise une heuristique simple.
    ai_confidence = 0.85
    ai_tags = {"detected": ["plastique", "encombrants"]}
    
    # Heuristique : Si le volume déclaré est anormalement grand (> 10m3), 
    # on baisse la confiance pour forcer une vérification humaine plus stricte.
    if payload.estimated_volume_m3 and payload.estimated_volume_m3 > 10.0:
        ai_confidence = 0.40
        ai_tags["detected"].append("volume_suspect")
    
    report = IllegalDumpReport(
        reporter_id=user_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        description=payload.description,
        estimated_volume_m3=payload.estimated_volume_m3,
        photo_url=payload.photo_url,
        status=ReportStatus.PENDING,
        ai_confidence_score=ai_confidence,
        ai_tags=ai_tags
    )
    
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def get_all_reports(db: AsyncSession) -> Sequence[IllegalDumpReport]:
    result = await db.execute(select(IllegalDumpReport).order_by(IllegalDumpReport.created_at.desc()))
    return result.scalars().all()


async def get_user_reports(db: AsyncSession, user_id: uuid.UUID) -> Sequence[IllegalDumpReport]:
    result = await db.execute(
        select(IllegalDumpReport)
        .where(IllegalDumpReport.reporter_id == user_id)
        .order_by(IllegalDumpReport.created_at.desc())
    )
    return result.scalars().all()


async def validate_report(
    db: AsyncSession, report_id: uuid.UUID, payload: IllegalDumpValidationStatus, admin_user: User
) -> IllegalDumpReport:
    """Valide ou rejette un signalement de dépôt sauvage et attribue une récompense."""
    
    if admin_user.role not in [UserRole.ADMIN, UserRole.MAIRIE]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé.")
        
    report = await db.get(IllegalDumpReport, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signalement introuvable.")
        
    if report.status != ReportStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Signalement déjà traité ({report.status}).")
        
    try:
        new_status = ReportStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Statut invalide.")
        
    report.status = new_status
    
    # Gestion des récompenses si validé
    if new_status == ReportStatus.VERIFIED and payload.reward_points and payload.reward_points > 0 and report.reporter_id:
        report.reward_awarded = payload.reward_points
        
        # Attribution des points à l'utilisateur
        result = await db.execute(select(Reward).where(Reward.user_id == report.reporter_id))
        reward = result.scalar_one_or_none()
        
        if not reward:
            reward = Reward(user_id=report.reporter_id, points=0, total_kg_recycled=0)
            db.add(reward)
            
        reward.points += payload.reward_points
        
        # Enregistrement de la transaction
        tx = RewardTransaction(
            user_id=report.reporter_id,
            action=RewardAction.ILLEGAL_DUMP_REPORT,
            points=payload.reward_points,
            balance_after=reward.points
        )
        db.add(tx)
        
    await db.commit()
    await db.refresh(report)
    return report
