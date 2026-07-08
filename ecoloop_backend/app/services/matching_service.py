import math
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.waste import WasteLot
from app.models.collector_profile import CollectorProfile, CollectorStatus, VerificationStatus
from app.models.collector_location import CollectorLocation

EARTH_RADIUS_KM = 6371.0
GLOBAL_MAX_RADIUS_KM = 15.0
GPS_MAX_AGE_HOURS = 2.0


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
    radius_km: float = GLOBAL_MAX_RADIUS_KM,
    limit: int = 10,
) -> list[tuple[User, float, float]]:
    """
    Filtre et trie les collecteurs actifs les plus pertinents pour un lot donné.
    Retourne une liste de tuples (User, distance_km, match_score).
    """
    # 1. Sélectionner tous les collecteurs actifs et vérifiés
    stmt = (
        select(User, CollectorProfile, CollectorLocation)
        .join(CollectorProfile, User.id == CollectorProfile.id)
        .join(CollectorLocation, User.id == CollectorLocation.collector_id)
        .where(
            User.role == UserRole.COLLECTEUR,
            User.is_active.is_(True),
            User.is_verified.is_(True),
            CollectorProfile.status == CollectorStatus.AVAILABLE,
            CollectorProfile.verification_status == VerificationStatus.VERIFIED,
            CollectorProfile.vehicle_capacity_kg >= float(lot.weight_kg),
        )
    )
    res = await db.execute(stmt)
    rows = res.all()

    candidates: list[tuple[User, float, float]] = []
    now = datetime.now(timezone.utc)
    gps_limit_time = now - timedelta(hours=GPS_MAX_AGE_HOURS)

    for user, profile, location in rows:
        # Filtre GPS périmé (GPS_MAX_AGE_HOURS = 2h)
        loc_updated_at = location.updated_at
        if loc_updated_at.tzinfo is None:
            loc_updated_at = loc_updated_at.replace(tzinfo=timezone.utc)
            
        if loc_updated_at < gps_limit_time:
            continue

        # Calcul distance
        distance = haversine_distance_km(
            float(lot.latitude), float(lot.longitude),
            float(location.latitude), float(location.longitude)
        )

        # Filtre de rayon d'activité individuel du collecteur
        if distance > profile.service_radius_km or distance > radius_km:
            continue

        # --- SCORING COMPARATIF ---
        # A. Score de distance (60%) : comparatif sur échelle commune (GLOBAL_MAX_RADIUS_KM)
        distance_score = 100.0 * (1.0 - (distance / GLOBAL_MAX_RADIUS_KM))
        distance_score = max(0.0, min(100.0, distance_score))

        # B. Score de réputation (20%) : moyenne des notes (5 étoiles -> 100, pas d'avis -> 80)
        reputation_score = profile.average_rating * 20.0 if profile.average_rating > 0 else 80.0

        # C. Score de fiabilité (20%) : taux de réussite des collectes (default 80 si aucune)
        if profile.total_collections_count > 0:
            reliability_score = (profile.completed_collections_count / profile.total_collections_count) * 100.0
        else:
            reliability_score = 80.0

        match_score = (distance_score * 0.6) + (reputation_score * 0.2) + (reliability_score * 0.2)

        candidates.append((user, distance, match_score))

    # Trier par score de matching décroissant
    candidates.sort(key=lambda x: x[2], reverse=True)
    return candidates[:limit]


async def notify_nearby_collectors(db: AsyncSession, lot: WasteLot) -> list[uuid.UUID]:
    """
    Recherche et notifie les collecteurs pertinents après la création d'un lot.
    """
    nearby = await find_nearby_collectors(db, lot)
    notified_ids = []
    
    for collector, distance, score in nearby:
        # Création d'une notification typée stockée en base
        from app.services.notification_service import create_db_notification
        await create_db_notification(
            db=db,
            user_id=collector.id,
            title="Nouveau lot disponible",
            content=f"Un lot de {lot.category.value} ({lot.weight_kg} kg) à {distance:.1f} km correspond à votre profil (Score: {score:.1f}).",
            notification_type="collection_request",
            entity_type="waste_lot",
            entity_id=lot.id
        )
        notified_ids.append(collector.id)
        
    return notified_ids
