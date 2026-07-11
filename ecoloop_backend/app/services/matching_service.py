import math
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.waste import WasteLot
from app.models.collector_profile import CollectorProfile, CollectorStatus
from app.models.user import User
from app.models.matching_decision import MatchingDecision
from app.models.user_location import UserLocation


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS points."""
    R = 6371.0  # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class MatchingService:
    @staticmethod
    async def suggest_best_collectors(
        db: AsyncSession,
        lot_id: uuid.UUID
    ) -> list[dict]:
        # 1. Fetch Waste Lot
        lot = await db.get(WasteLot, lot_id)
        if not lot:
            raise ValueError("Lot de déchets introuvable.")

        # 2. Fetch all active collectors
        stmt = select(CollectorProfile, User).join(User, CollectorProfile.id == User.id)
        result = await db.execute(stmt)
        profiles_list = result.all()

        candidates = []

        for profile, user in profiles_list:
            # Get latest current GPS coordinates of the collector from user_locations
            loc_result = await db.execute(
                select(UserLocation).where(
                    UserLocation.user_id == user.id,
                    UserLocation.is_current == True
                ).order_by(UserLocation.created_at.desc()).limit(1)
            )
            latest_loc = loc_result.scalar_one_or_none()

            # Default coordinates to lot location if no location log exists
            lat_c = float(latest_loc.latitude) if latest_loc else float(lot.latitude)
            lng_c = float(latest_loc.longitude) if latest_loc else float(lot.longitude)

            distance_km = haversine_distance(float(lot.latitude), float(lot.longitude), lat_c, lng_c)

            # Sub-scores calculation
            # Distance: 30% of total. Closer is better.
            dist_score = max(0.0, 100.0 - (distance_km * 5.0))  # 100 at 0km, 50 at 10km, 0 at 20km+

            # Reliability: 35% of total.
            rel_score = float(profile.collector_reliability_score) * 100.0

            # Capacity: 20% of total.
            capacity_fit = 100.0 if float(profile.vehicle_capacity_kg) >= float(lot.estimated_weight_kg) else 0.0

            # Availability: 10% of total.
            avail_score = 100.0 if profile.status == CollectorStatus.AVAILABLE else 0.0

            # Experience: 5% of total. Completed missions boost.
            exp_score = min(100.0, float(profile.completed_missions) * 20.0)  # 100 if completed >= 5 missions

            # Final Score Calculation
            final_score = (
                dist_score * 0.30 +
                rel_score * 0.35 +
                capacity_fit * 0.20 +
                avail_score * 0.10 +
                exp_score * 0.05
            )

            explanation_str = (
                f"Collecteur situé à {distance_km:.2f} km. "
                f"Fiabilité évaluée à {rel_score:.1f}%. "
                f"Capacité de véhicule ({profile.vehicle_capacity_kg} kg) adaptée. "
                f"Statut : {profile.status.value}."
            )

            explanation = {
                "distance": f"{distance_km:.2f} km",
                "reliability": f"{rel_score:.1f}%",
                "capacity": f"{profile.vehicle_capacity_kg} kg",
                "availability": profile.status.value,
                "experience": f"{profile.completed_missions} missions"
            }

            candidates.append({
                "collector_id": user.id,
                "full_name": user.full_name,
                "phone": user.phone,
                "distance_score": dist_score,
                "reliability_score": rel_score,
                "capacity_score": capacity_fit,
                "availability_score": avail_score,
                "experience_score": exp_score,
                "final_score": final_score,
                "explanation_text": explanation_str,
                "decision_explanation": explanation
            })

        # Sort candidates by final score descending
        candidates.sort(key=lambda x: x["final_score"], reverse=True)

        # Save candidates to matching_decisions (mark the top candidate as selected)
        for index, cand in enumerate(candidates):
            decision = MatchingDecision(
                lot_id=lot_id,
                collector_id=cand["collector_id"],
                distance_score=cand["distance_score"],
                reliability_score=cand["reliability_score"],
                capacity_score=cand["capacity_score"],
                availability_score=cand["availability_score"],
                experience_score=cand["experience_score"],
                final_score=cand["final_score"],
                selected=(index == 0 and cand["final_score"] > 50.0),  # Auto-select the best one if score > 50
                decision_explanation=cand["decision_explanation"]
            )
            db.add(decision)
            
        await db.flush()

        return candidates


async def notify_nearby_collectors(db: AsyncSession, lot: WasteLot) -> None:
    # Logic to send notifications to nearby collectors within radius (mock)
    pass
