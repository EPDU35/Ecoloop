import uuid
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collection import Collection, CollectionStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.waste import WasteLot
from app.models.collector_profile import CollectorProfile
from app.schemas.review_schema import ReviewCreateSchema


async def create_review(db: AsyncSession, reviewer: User, payload: ReviewCreateSchema) -> Review:
    # 1. Récupérer la collecte
    col_result = await db.execute(select(Collection).where(Collection.id == payload.collection_id))
    collection = col_result.scalar_one_or_none()
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collecte introuvable.")

    # Vérifier que la collecte est validée
    if collection.status != CollectionStatus.VALIDEE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez évaluer une collecte que lorsqu'elle est validée."
        )

    # Récupérer le lot
    lot_result = await db.execute(select(WasteLot).where(WasteLot.id == collection.waste_lot_id))
    lot = lot_result.scalar_one_or_none()
    if lot is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Lot associé introuvable.")

    # 2. Vérifier que le reviewer fait partie de la collecte
    if reviewer.id != collection.collector_id and reviewer.id != lot.producer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas participé à cette collecte."
        )

    # 3. Déterminer qui est évalué
    if reviewer.id == collection.collector_id:
        # Le collecteur évalue le producteur
        if payload.reviewed_id != lot.producer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'utilisateur évalué doit être le producteur de cette collecte."
            )
        reviewer_role = UserRole.COLLECTEUR
    else:
        # Le producteur évalue le collecteur
        if payload.reviewed_id != collection.collector_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'utilisateur évalué doit être le collecteur de cette collecte."
            )
        reviewer_role = UserRole.PRODUCTEUR

    # 4. Vérifier s'il n'y a pas déjà un avis
    dup_result = await db.execute(
        select(Review).where(Review.collection_id == collection.id, Review.reviewer_id == reviewer.id)
    )
    if dup_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vous avez déjà évalué cette collecte."
        )

    # 5. Créer l'avis
    review = Review(
        collection_id=collection.id,
        reviewer_id=reviewer.id,
        reviewed_id=payload.reviewed_id,
        reviewer_role=reviewer_role,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(review)
    await db.flush()

    # 6. Recalculer la note moyenne si c'est un collecteur qui a été évalué
    # (le MVP gère surtout la réputation des collecteurs pour le matching)
    profile_result = await db.execute(
        select(CollectorProfile).where(CollectorProfile.id == payload.reviewed_id).with_for_update()
    )
    profile = profile_result.scalar_one_or_none()
    if profile is not None:
        avg_res = await db.execute(
            select(func.avg(Review.rating)).where(Review.reviewed_id == payload.reviewed_id)
        )
        avg_rating = avg_res.scalar()
        if avg_rating is not None:
            profile.average_rating = float(avg_rating)
            await db.flush()

    return review
