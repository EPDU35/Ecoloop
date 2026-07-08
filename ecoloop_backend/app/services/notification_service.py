"""
Interface de notification. L'implémentation réelle (push, SMS, email) sera
branchée ici (ex: Firebase Cloud Messaging, Twilio). Découplée du reste du
code pour ne jamais dépendre d'un fournisseur particulier dans les contrôleurs.

RÈGLE DE SÉCURITÉ : ne jamais logguer le contenu complet d'une notification si
elle contient des données personnelles ; ne jamais inclure de token/OTP dans
un message poussé via un canal non chiffré sans nécessité absolue.
"""
import logging
import uuid
from typing import Protocol

logger = logging.getLogger("ecoloop.notifications")


class NotificationSender(Protocol):
    async def send(self, user_id: uuid.UUID, title: str, body: str) -> None: ...


class LoggingNotificationSender:
    """Implémentation par défaut pour le développement : log uniquement, aucun envoi réel."""

    async def send(self, user_id: uuid.UUID, title: str, body: str) -> None:
        logger.info("Notification -> user=%s title=%s", user_id, title)


_sender: NotificationSender = LoggingNotificationSender()


def set_notification_sender(sender: NotificationSender) -> None:
    """Permet d'injecter une implémentation réelle (FCM, Twilio...) au démarrage."""
    global _sender
    _sender = sender


async def notify_new_lot_available(user_id: uuid.UUID, lot_category: str) -> None:
    await _sender.send(user_id, "Nouveau lot disponible", f"Un nouveau lot de {lot_category} est proche de vous.")


async def notify_collection_reserved(user_id: uuid.UUID) -> None:
    await _sender.send(user_id, "Collecte réservée", "Votre lot a été réservé par un collecteur.")


async def notify_collection_validated(user_id: uuid.UUID) -> None:
    await _sender.send(user_id, "Collecte validée", "Votre collecte a été validée avec succès.")


async def notify_payment_completed(user_id: uuid.UUID, net_amount: float) -> None:
    await _sender.send(user_id, "Paiement effectué", f"Un paiement de {net_amount} FCFA a été enregistré.")
