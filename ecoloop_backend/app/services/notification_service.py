import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.notification import Notification, NotificationType
from app.models.device_token import DeviceToken
from app.services.firebase_service import firebase_service

logger = logging.getLogger("ecoloop.notifications")


async def _create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    content: str,
    type: NotificationType,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        type=type,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.add(notification)
    await db.flush()

    try:
        result = await db.execute(
            select(DeviceToken).where(
                DeviceToken.user_id == user_id,
                DeviceToken.is_active.is_(True),
            )
        )
        tokens = result.scalars().all()
        for dt in tokens:
            firebase_service.send_push_notification(
                device_token=dt.token,
                title=title,
                body=content,
                data={"type": type.value, "entity_type": entity_type, "entity_id": str(entity_id)} if entity_id else None,
            )
    except Exception as e:
        logger.error(f"Erreur envoi push notification: {e}")

    return notification


async def notify_new_lot_available(
    db: AsyncSession, user_id: uuid.UUID, lot_category: str, lot_id: uuid.UUID
) -> None:
    await _create_notification(
        db, user_id, "Nouveau lot disponible",
        f"Un nouveau lot de {lot_category} est disponible près de chez vous.",
        NotificationType.COLLECTION_REQUEST, entity_type="waste_lot", entity_id=lot_id,
    )
    logger.info("Notification -> user=%s title=%s", user_id, "Nouveau lot disponible")


async def notify_collection_reserved(
    db: AsyncSession, user_id: uuid.UUID, collection_id: uuid.UUID
) -> None:
    await _create_notification(
        db, user_id, "Collecte réservée",
        "Votre lot a été réservé par un collecteur.",
        NotificationType.COLLECTION_ACCEPTED, entity_type="collection", entity_id=collection_id,
    )
    logger.info("Notification -> user=%s title=%s", user_id, "Collecte réservée")


async def notify_validation_code(
    db: AsyncSession, producer_id: uuid.UUID, validation_code: str
) -> None:
    body = (
        f"Votre code de validation de collecte est {validation_code}. "
        "Communiquez-le uniquement au collecteur venu récupérer votre lot."
    )
    await _create_notification(
        db, producer_id, "Code de validation de collecte",
        body, NotificationType.SYSTEM,
    )
    if settings.debug and not settings.is_production:
        logger.info("Notification -> user=%s title=%s code=%s", producer_id, "Code de validation", validation_code)
    else:
        logger.info("Notification -> user=%s title=%s [masqué: contenu sensible]", producer_id, "Code de validation")


async def notify_collection_validated(
    db: AsyncSession, user_id: uuid.UUID, collection_id: uuid.UUID
) -> None:
    await _create_notification(
        db, user_id, "Collecte validée",
        "Votre collecte a été validée avec succès.",
        NotificationType.COLLECTION_ACCEPTED, entity_type="collection", entity_id=collection_id,
    )
    logger.info("Notification -> user=%s title=%s", user_id, "Collecte validée")


async def notify_payment_completed(
    db: AsyncSession, user_id: uuid.UUID, net_amount: float
) -> None:
    await _create_notification(
        db, user_id, "Paiement effectué",
        f"Un paiement de {net_amount} FCFA a été enregistré.",
        NotificationType.PAYMENT_RECEIVED,
    )
    logger.info("Notification -> user=%s title=%s", user_id, "Paiement effectué")
