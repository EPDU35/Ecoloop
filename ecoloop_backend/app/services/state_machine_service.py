import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.waste import WasteLot, LotStatus
from app.services.eco_points_service import EcoPointsService


class StateMachineError(Exception):
    pass


class StateMachineService:
    ALLOWED_LOT_TRANSITIONS = {
        LotStatus.CREATED: {LotStatus.DISPONIBLE},
        LotStatus.DISPONIBLE: {LotStatus.OFFER_RECEIVED, LotStatus.EXPIRED, LotStatus.ANNULE},
        LotStatus.OFFER_RECEIVED: {LotStatus.ACCEPTED, LotStatus.DISPONIBLE, LotStatus.ANNULE},
        LotStatus.ACCEPTED: {LotStatus.EN_MISSION, LotStatus.ANNULE},
        LotStatus.EN_MISSION: {LotStatus.COLLECTE, LotStatus.ANNULE},
        LotStatus.COLLECTE: {LotStatus.QUALITY_CHECK, LotStatus.ANNULE},
        LotStatus.QUALITY_CHECK: {LotStatus.SUSPENDED, LotStatus.PAYE, LotStatus.ANNULE},
        LotStatus.SUSPENDED: {LotStatus.PAYE, LotStatus.ANNULE},
        LotStatus.PAYE: set(),
        LotStatus.ANNULE: set(),
        LotStatus.EXPIRED: set()
    }

    @staticmethod
    async def validate_and_transition_lot(
        db: AsyncSession,
        lot_id: uuid.UUID,
        new_status: LotStatus,
        actor_id: uuid.UUID
    ) -> WasteLot:
        # SELECT FOR UPDATE to acquire pessimist database lock on target lot
        stmt = select(WasteLot).where(WasteLot.id == lot_id).with_for_update()
        result = await db.execute(stmt)
        lot = result.scalar_one_or_none()

        if not lot:
            raise StateMachineError("Lot de déchets introuvable.")

        current_status = lot.status
        if current_status == new_status:
            return lot  # Idempotent return

        allowed = StateMachineService.ALLOWED_LOT_TRANSITIONS.get(current_status, set())
        if new_status not in allowed:
            raise StateMachineError(
                f"Transition d'état invalide : {current_status.value} -> {new_status.value}."
            )

        # Audit old value
        old_val = {"status": current_status.value}
        new_val = {"status": new_status.value}

        # Apply transition
        lot.status = new_status
        await db.flush()

        # Log transition audit event
        await EcoPointsService.log_audit(
            db, actor_id, "STATE_TRANSITION", "waste_lots", lot.id, old_val, new_val
        )

        return lot
