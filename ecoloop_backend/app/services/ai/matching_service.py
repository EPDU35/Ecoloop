import math
from typing import Dict, Any, List

class MatchingService:
    """
    Service IA pour le scoring des collecteurs.
    """

    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calcule la distance en km (Formule de Haversine approximée pour la démo)."""
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
            * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    @staticmethod
    async def get_best_collectors(lot_lat: float, lot_lon: float, lot_weight_kg: float, collectors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calcule un score de matching.
        Score = Distance 40% + Capacité 25% + Dispo 20% + Perf 15%
        """
        scored_collectors = []

        for collector in collectors:
            # 1. Distance (max 40 pts). Plus c'est proche, plus le score est élevé.
            dist = MatchingService.calculate_distance(lot_lat, lot_lon, collector['lat'], collector['lon'])
            dist_score = max(0, 40 - (dist * 2)) # -2 pts par km
            
            # 2. Capacité (max 25 pts)
            capacity = collector.get('capacity_kg', 500)
            capacity_score = 25 if capacity >= lot_weight_kg else (capacity / lot_weight_kg) * 25
            
            # 3. Disponibilité (max 20 pts)
            availability_score = 20 if collector.get('is_available', True) else 0
            
            # 4. Performance (max 15 pts). Basé sur la note / 5.
            rating = collector.get('rating', 4.5)
            perf_score = (rating / 5.0) * 15

            total_score = dist_score + capacity_score + availability_score + perf_score

            scored_collectors.append({
                "collector_id": collector['id'],
                "name": collector.get('name', 'Collecteur'),
                "rating": rating,
                "distance_km": round(dist, 1),
                "score_details": {
                    "distance_score": round(dist_score, 1),
                    "capacity_score": round(capacity_score, 1),
                    "availability_score": round(availability_score, 1),
                    "performance_score": round(perf_score, 1)
                },
                "total_score": round(total_score, 1)
            })

        # Trier par score décroissant
        return sorted(scored_collectors, key=lambda x: x['total_score'], reverse=True)
