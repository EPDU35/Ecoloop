import logging
from typing import Optional

from app.config.settings import settings

logger = logging.getLogger("ecoloop.firebase")

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    _firebase_available = True
except ImportError:
    _firebase_available = False

    class messaging:
        @staticmethod
        def send(*args, **kwargs):
            raise NotImplementedError("firebase-admin not installed")

        class Message:
            def __init__(self, **kwargs): pass

        class Notification:
            def __init__(self, **kwargs): pass


class FirebaseService:
    def __init__(self):
        self._initialized = False
        self._init_firebase()

    def _init_firebase(self):
        if not _firebase_available:
            logger.warning("firebase-admin non installé. Push notifications désactivées.")
            return
        if not settings.firebase_credentials_path:
            logger.info("FIREBASE_CREDENTIALS_PATH non configuré. Push notifications désactivées.")
            return
        try:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
            self._initialized = True
            logger.info("Firebase initialisé avec succès")
        except Exception as e:
            logger.error(f"Impossible d'initialiser Firebase: {e}")

    def send_push_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[dict] = None,
    ) -> bool:
        if not self._initialized:
            logger.warning("Firebase non initialisé, notification ignorée")
            return False
        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data={k: str(v) for k, v in (data or {}).items()},
                token=device_token,
            )
            response = messaging.send(message)
            logger.info(f"Notification push envoyée: {response}")
            return True
        except Exception as e:
            logger.error(f"Erreur envoi notification push: {e}")
            return False

    def send_push_to_topic(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[dict] = None,
    ) -> bool:
        if not self._initialized:
            return False
        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data={k: str(v) for k, v in (data or {}).items()},
                topic=topic,
            )
            response = messaging.send(message)
            logger.info(f"Notification push topic envoyée: {response}")
            return True
        except Exception as e:
            logger.error(f"Erreur envoi notification topic: {e}")
            return False


firebase_service = FirebaseService()
