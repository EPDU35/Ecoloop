from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.models.user import User
from app.models.reward import Reward
from app.models.reward_transaction import RewardTransaction
from app.schemas.reward_schema import RewardOutSchema, RewardTransactionOutSchema

router = APIRouter(prefix="/rewards", tags=["Récompenses"])


@router.get("/me", response_model=RewardOutSchema)
async def get_my_rewards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère le solde et le statut des récompenses de l'utilisateur connecté.
    """
    stmt = select(Reward).where(Reward.user_id == current_user.id)
    res = await db.execute(stmt)
    reward = res.scalar_one_or_none()
    
    if reward is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil de récompenses introuvable."
        )
        
    return reward


@router.get("/history", response_model=list[RewardTransactionOutSchema])
async def get_my_points_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère l'historique d'audit des transactions de points de l'utilisateur.
    """
    stmt = (
        select(RewardTransaction)
        .where(RewardTransaction.user_id == current_user.id)
        .order_by(RewardTransaction.created_at.desc())
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())
