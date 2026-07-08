import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.middlewares.jwt import get_current_user
from app.models.user import User
from app.models.review import Review
from app.schemas.review_schema import ReviewCreateSchema, ReviewOutSchema
from app.controllers import review_controller

router = APIRouter(prefix="/reviews", tags=["Avis & Évaluations"])


@router.post("", response_model=ReviewOutSchema, status_code=status.HTTP_201_CREATED)
async def create_new_review(
    payload: ReviewCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crée un avis et une évaluation sur une collecte.
    """
    review = await review_controller.create_review(db, current_user, payload)
    await db.commit()
    return review


@router.get("/collection/{collection_id}", response_model=list[ReviewOutSchema])
async def list_collection_reviews(
    collection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Liste les avis associés à une collecte spécifique.
    """
    stmt = select(Review).where(Review.collection_id == collection_id)
    res = await db.execute(stmt)
    return list(res.scalars().all())
