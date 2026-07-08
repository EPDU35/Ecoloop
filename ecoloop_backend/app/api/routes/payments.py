import hashlib
import hmac
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.controllers.payment_controller import mark_transaction_paid
from app.schemas.transaction_schema import TransactionOutSchema

router = APIRouter(prefix="/payments", tags=["Paiements"])


def _verify_webhook_signature(raw_body: bytes, signature_header: str | None) -> bool:
    """
    Vérifie la signature HMAC-SHA256 envoyée par le prestataire de paiement,
    pour s'assurer que la requête provient bien de lui et n'a pas été altérée.
    Comparaison en temps constant (hmac.compare_digest) pour éviter le timing attack.
    """
    if not signature_header or not settings.payment_webhook_secret:
        return False
    expected = hmac.new(settings.payment_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


@router.post("/webhook", response_model=TransactionOutSchema)
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    raw_body = await request.body()
    signature = request.headers.get("x-webhook-signature")

    if not _verify_webhook_signature(raw_body, signature):
        # Réponse volontairement neutre : ne pas indiquer si c'est la signature
        # ou la structure de la requête qui pose problème.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Requête webhook non authentifiée.")

    payload = await request.json()
    try:
        transaction_id = uuid.UUID(str(payload["transaction_id"]))
        external_reference = str(payload["reference"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload webhook invalide.")

    transaction = await mark_transaction_paid(db, transaction_id, external_reference)
    await db.commit()
    return transaction
