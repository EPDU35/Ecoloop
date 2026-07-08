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

from app.config.settings import settings

logger = logging.getLogger("ecoloop.notifications")


class NotificationSender(Protocol):
    async def send(self, user_id: uuid.UUID, title: str, body: str, *, sensitive: bool = False) -> None: ...


class LoggingNotificationSender:
    """
    Implémentation par défaut pour le développement : log uniquement, aucun envoi réel.

    RÈGLE DE SÉCURITÉ : le corps d'une notification marquée `sensitive=True` (ex :
    code de validation OTP) n'est jamais écrit en clair dans les logs, sauf en
    environnement de développement explicite (DEBUG=true et ENVIRONMENT != production).
    Ceci permet de tester le flux localement en attendant l'intégration SMS/push
    réelle, sans jamais exposer de secret dans des logs de production.
    """

    async def send(self, user_id: uuid.UUID, title: str, body: str, *, sensitive: bool = False) -> None:
        if sensitive and not (settings.debug and not settings.is_production):
            logger.info("Notification -> user=%s title=%s body=[masqué: contenu sensible]", user_id, title)
        else:
            logger.info("Notification -> user=%s title=%s body=%s", user_id, title, body)


_sender: NotificationSender = LoggingNotificationSender()


def set_notification_sender(sender: NotificationSender) -> None:
    """Permet d'injecter une implémentation réelle (FCM, Twilio...) au démarrage."""
    global _sender
    _sender = sender


async def notify_new_lot_available(user_id: uuid.UUID, lot_category: str) -> None:
    await _sender.send(user_id, "Nouveau lot disponible", f"Un nouveau lot de {lot_category} est proche de vous.")


async def notify_collection_reserved(user_id: uuid.UUID) -> None:
    await _sender.send(user_id, "Collecte réservée", "Votre lot a été réservé par un collecteur.")


async def notify_validation_code(producer_id: uuid.UUID, validation_code: str) -> None:
    """
    Transmet le code de validation au PRODUCTEUR (jamais au collecteur, qui est
    justement celui qui doit le saisir pour prouver la légitimité de la collecte).
    En production, ceci doit être branché sur un vrai canal SMS/push (Twilio, FCM...) ;
    tant que ce n'est pas fait, `LoggingNotificationSender` ne l'écrira en clair que
    dans les logs de développement (voir `sensitive=True`).
    """
    body = (
        f"Votre code de validation de collecte est {validation_code}. "
        "Communiquez-le uniquement au collecteur venu récupérer votre lot."
    )
    await _sender.send(producer_id, "Code de validation de collecte", body, sensitive=True)


async def notify_collection_validated(user_id: uuid.UUID) -> None:
    await _sender.send(user_id, "Collecte validée", "Votre collecte a été validée avec succès.")


async def notify_payment_completed(user_id: uuid.UUID, net_amount: float) -> None:
    await _sender.send(user_id, "Paiement effectué", f"Un paiement de {net_amount} FCFA a été enregistré.")
