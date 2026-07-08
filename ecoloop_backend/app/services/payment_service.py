"""
Logique de paiement : "Poids × Prix/kg − Commission EcoLoop = Paiement" (dossier technique).

RÈGLE DE SÉCURITÉ CRITIQUE : tous les montants sont recalculés côté serveur à partir
de données déjà validées et persistées (lot, collecte). Le client ne peut JAMAIS
envoyer un montant directement — toute tentative serait ignorée. C'est la principale
protection contre la fraude sur les paiements.
"""
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collection import Collection, CollectionStatus
from app.models.transaction import PaymentMethod, Transaction, TransactionStatus
from app.models.waste import WasteLot

COMMISSION_RATE = Decimal("0.10")  # 10% — à externaliser en configuration si besoin de variation


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_amounts(weight_kg: Decimal, price_per_kg: Decimal) -> tuple[Decimal, Decimal, Decimal]:
    gross = _round2(weight_kg * price_per_kg)
    commission = _round2(gross * COMMISSION_RATE)
    net = _round2(gross - commission)
    return gross, commission, net


class PaymentError(Exception):
    pass


async def create_transaction_for_collection(
    db: AsyncSession,
    collection: Collection,
    lot: WasteLot,
    payment_method: PaymentMethod,
) -> Transaction:
    if collection.status != CollectionStatus.VALIDEE:
        raise PaymentError("La collecte doit être validée avant tout paiement.")

    if collection.actual_weight_kg is None:
        raise PaymentError("Poids réel manquant : la collecte n'a pas été correctement validée.")

    existing = await db.execute(select(Transaction).where(Transaction.collection_id == collection.id))
    if existing.scalar_one_or_none() is not None:
        raise PaymentError("Une transaction existe déjà pour cette collecte.")

    weight = Decimal(str(collection.actual_weight_kg))
    price = Decimal(str(lot.price_per_kg))
    gross, commission, net = compute_amounts(weight, price)

    transaction = Transaction(
        collection_id=collection.id,
        producer_id=lot.producer_id,
        collector_id=collection.collector_id,
        gross_amount=gross,
        commission_amount=commission,
        net_amount=net,
        payment_method=payment_method,
        status=TransactionStatus.EN_ATTENTE,
    )
    db.add(transaction)
    await db.flush()
    return transaction
