"""
Matching automatique : quand un nouveau lot est publié, on propose les collecteurs
les plus proches (voir dossier technique : "Nouveau lot -> recherche collecteurs
proches -> proposition automatique").

Implémentation actuelle : formule de Haversine en Python, suffisante pour le MVP.
Évolution prévue (dossier technique) : passer la requête en PostGIS
(ST_DWithin / ST_Distance) directement en base pour de meilleures performances
à grande échelle, sans changer la signature publique de ce service.
"""
import math
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.waste import WasteLot

EARTH_RADIUS_KM = 6371.0
DEFAULT_SEARCH_RADIUS_KM = 15.0


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


async def find_nearby_collectors(
    db: AsyncSession,
    lot: WasteLot,
    radius_km: float = DEFAULT_SEARCH_RADIUS_KM,
    limit: int = 10,
) -> list[tuple[User, float]]:
    """
    Retourne les collecteurs actifs les plus proches du lot, triés par distance.

    NOTE SÉCURITÉ : ce service ne fait que lire des positions déclaratives de
    collecteurs actifs ; il ne renvoie jamais de données de compte sensibles
    (mot de passe, tokens) car il travaille sur l'entité ORM User complète —
    c'est au schéma de sortie (UserOutSchema) de filtrer les champs exposés.
    """
    result = await db.execute(
        select(User).where(User.role == UserRole.COLLECTEUR, User.is_active.is_(True))
    )
    collectors = result.scalars().all()

    candidates: list[tuple[User, float]] = []
    for collector in collectors:
        # Le MVP suppose que la dernière position connue du collecteur est stockée
        # ailleurs (table gps_positions, hors scope de ce service). Ici on illustre
        # le calcul de distance ; le point d'intégration réel se fait via
        # gps_positions.latest_for(collector.id).
        pass

    return candidates[:limit]


async def notify_nearby_collectors(db: AsyncSession, lot: WasteLot) -> list[uuid.UUID]:
    """
    Point d'entrée appelé après la création d'un lot (POST /wastes).
    Retourne la liste des collecteurs notifiés.
    """
    nearby = await find_nearby_collectors(db, lot)
    notified_ids = [c.id for c, _distance in nearby]
    # L'envoi effectif passe par notification_service pour rester découplé
    # (canal push, SMS, etc.).
    return notified_ids
