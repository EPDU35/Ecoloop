import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.database import get_db
from app.middlewares.jwt import get_current_verified_user
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.models.waste import WasteLot, LotStatus
from app.models.purchase_offer import PurchaseOffer, OfferStatus
from app.models.collection_mission import CollectionMission, MissionStatus, ArrivalStatus
from app.models.transaction import Transaction, TransactionStatus
from app.models.dispute import Dispute, DisputeReason, DisputeStatus
from app.models.verification_evidence import EvidenceType
from app.schemas.waste_schema import WasteLotCreateSchema
from app.schemas.v2_schemas import (
    PurchaseOfferCreateSchema,
    VerifyWeightSchema,
    CollectionMissionCreateSchema,
    EcoPointsWithdrawalSchema,
    DisputeCreateSchema,
)
from app.services.eco_points_service import EcoPointsService, EcoPointsError
from app.services.state_machine_service import StateMachineService, StateMachineError
from app.services.matching_service import MatchingService
from app.services.storage_service import StorageService
from app.services.permission_service import PermissionService
from app.utils.helpers import limiter

router = APIRouter(prefix="/api/v2", tags=["EcoLoop V2/V3.5 API"])


@router.post("/lots", status_code=status.HTTP_201_CREATED)
async def create_lot_v2(
    payload: WasteLotCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PRODUCTEUR))
):
    lot = WasteLot(
        producer_id=current_user.id,
        category=payload.category,
        description=payload.description,
        weight_kg=payload.weight_kg,
        estimated_weight_kg=payload.weight_kg,
        price_per_kg=payload.price_per_kg,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=LotStatus.DISPONIBLE
    )
    db.add(lot)
    await db.commit()
    return {
        "id": lot.id,
        "category": lot.category,
        "status": lot.status,
        "estimated_weight_kg": lot.estimated_weight_kg,
        "price_per_kg": lot.price_per_kg
    }


@router.post("/lots/{lot_id}/offers", status_code=status.HTTP_201_CREATED)
async def create_offer(
    lot_id: uuid.UUID,
    payload: PurchaseOfferCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INDUSTRIEL))
):
    lot = await db.get(WasteLot, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lot de déchets introuvable.")

    offer = PurchaseOffer(
        lot_id=lot_id,
        company_id=current_user.id,
        price_per_kg=payload.price_per_kg,
        initial_price_per_kg=payload.price_per_kg,
        final_price_per_kg=payload.price_per_kg,
        status=OfferStatus.PENDING
    )
    db.add(offer)
    
    try:
        await StateMachineService.validate_and_transition_lot(db, lot_id, LotStatus.OFFER_RECEIVED, current_user.id)
    except StateMachineError as e:
        # Ignore transition check if already in OFFER_RECEIVED
        pass
        
    await db.commit()
    return {
        "id": offer.id,
        "lot_id": offer.lot_id,
        "company_id": offer.company_id,
        "price_per_kg": offer.price_per_kg,
        "status": offer.status
    }


@router.post("/lots/{lot_id}/offers/{offer_id}/accept")
async def accept_offer(
    lot_id: uuid.UUID,
    offer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.PRODUCTEUR))
):
    lot = await db.get(WasteLot, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lot de déchets introuvable.")
    if lot.producer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas le propriétaire de ce lot.")

    offer_result = await db.execute(
        select(PurchaseOffer).where(PurchaseOffer.id == offer_id, PurchaseOffer.lot_id == lot_id)
    )
    selected_offer = offer_result.scalar_one_or_none()
    if not selected_offer:
        raise HTTPException(status_code=404, detail="Offre d'achat introuvable.")

    # Accept selected offer
    selected_offer.status = OfferStatus.ACCEPTED
    selected_offer.accepted_at = datetime.now(timezone.utc)
    selected_offer.accepted_by_user_id = current_user.id

    # Reject other offers
    other_offers_result = await db.execute(
        select(PurchaseOffer).where(PurchaseOffer.lot_id == lot_id, PurchaseOffer.id != offer_id)
    )
    other_offers = other_offers_result.scalars().all()
    for off in other_offers:
        off.status = OfferStatus.REJECTED

    try:
        await StateMachineService.validate_and_transition_lot(db, lot_id, LotStatus.ACCEPTED, current_user.id)
    except StateMachineError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await db.commit()
    return {"message": "Offre acceptée avec succès.", "lot_status": lot.status}


@router.post("/lots/{lot_id}/verify-weight")
async def verify_weight(
    lot_id: uuid.UUID,
    payload: VerifyWeightSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COLLECTEUR))
):
    lot = await db.get(WasteLot, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lot de déchets introuvable.")

    lot.actual_weight_kg = payload.actual_weight_kg
    lot.verification_method = payload.verification_method
    lot.verification_photo_url = payload.verification_photo_url
    lot.weight_verified_by = current_user.id
    
    arr_status = ArrivalStatus(payload.arrival_status)
    target_status = LotStatus.QUALITY_CHECK if arr_status == ArrivalStatus.COLLECTED else LotStatus.ANNULE

    try:
        await StateMachineService.validate_and_transition_lot(db, lot_id, target_status, current_user.id)
    except StateMachineError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await db.commit()
    return {
        "lot_id": lot.id,
        "status": lot.status,
        "actual_weight_kg": lot.actual_weight_kg,
        "verification_method": lot.verification_method
    }


@router.post("/lots/{lot_id}/matching")
async def suggest_collectors(
    lot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    try:
        suggestions = await MatchingService.suggest_best_collectors(db, lot_id)
        await db.commit()
        return {"status": "success", "suggestions": suggestions}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/lots/{lot_id}/evidences")
@limiter.limit("20/minute")
async def upload_evidence(
    request: Request,
    lot_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    evidence = await StorageService.upload_verification_evidence(
        db=db,
        file=file,
        uploaded_by_id=current_user.id,
        entity_type="waste_lots",
        entity_id=lot_id,
        evidence_type=EvidenceType.WEIGHT_PHOTO
    )
    await db.commit()
    return {
        "id": evidence.id,
        "file_url": evidence.file_url,
        "file_hash": evidence.file_hash,
        "uploaded_by_id": evidence.uploaded_by_id
    }


@router.post("/collection-missions", status_code=status.HTTP_201_CREATED)
async def create_mission(
    payload: CollectionMissionCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INDUSTRIEL))
):
    idem_result = await db.execute(
        select(CollectionMission).where(CollectionMission.idempotency_key == payload.idempotency_key)
    )
    existing_mission = idem_result.scalar_one_or_none()
    if existing_mission:
        return existing_mission

    mission = CollectionMission(
        collector_id=payload.collector_id,
        creator_id=current_user.id,
        assigned_collector_id=payload.collector_id,
        status=MissionStatus.PENDING,
        zone=payload.zone,
        capacity_kg=payload.capacity_kg,
        center_lat=payload.center_lat,
        center_lng=payload.center_lng,
        radius_km=payload.radius_km,
        idempotency_key=payload.idempotency_key
    )
    db.add(mission)
    await db.commit()
    return mission


@router.post("/transactions/{transaction_id}/pay")
async def pay_transaction(
    transaction_id: uuid.UUID,
    idempotency_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    PermissionService.verify_can_validate_payment(current_user)
    try:
        tx = await EcoPointsService.process_marketplace_payout(db, transaction_id, idempotency_key)
        
        # Transition associated lot state to PAYE
        if tx.lot_id:
            await StateMachineService.validate_and_transition_lot(db, tx.lot_id, LotStatus.PAYE, current_user.id)
            
        await db.commit()
        return {
            "transaction_id": tx.id,
            "status": tx.status,
            "price_per_kg_applied": tx.price_per_kg_applied,
            "weight_applied": tx.weight_applied,
            "household_reward": tx.household_reward
        }
    except (EcoPointsError, StateMachineError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ecopoints/{user_id}/balance")
async def get_balance(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé.")

    account = await EcoPointsService.get_or_create_account(db, user_id)
    return {
        "user_id": user_id,
        "balance": account.eco_points_balance_cache
    }


@router.post("/ecopoints/{user_id}/withdraw")
@limiter.limit("3/minute")
async def withdraw_points(
    request: Request,
    user_id: uuid.UUID,
    payload: EcoPointsWithdrawalSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé.")

    try:
        tx = await EcoPointsService.request_withdrawal(
            db, user_id, payload.amount, payload.phone, payload.idempotency_key
        )
        await db.commit()
        return {
            "transaction_id": tx.id,
            "amount": tx.amount,
            "status": tx.status
        }
    except EcoPointsError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/disputes", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def create_dispute_endpoint(
    request: Request,
    payload: DisputeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user)
):
    try:
        reason = DisputeReason(payload.reason)
    except ValueError:
        raise HTTPException(status_code=400, detail="Motif de litige invalide.")

    dispute = await EcoPointsService.open_dispute(
        db, payload.transaction_id, current_user.id, reason
    )
    
    # Try to suspend the associated lot during dispute
    tx = await db.get(Transaction, payload.transaction_id)
    if tx and tx.lot_id:
        try:
            await StateMachineService.validate_and_transition_lot(db, tx.lot_id, LotStatus.SUSPENDED, current_user.id)
        except StateMachineError:
            pass

    await db.commit()
    return dispute
