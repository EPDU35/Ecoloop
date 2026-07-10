from typing import Dict, Any

class ImpactService:
    """
    Service pour calculer l'EcoScore et les métriques d'impact environnemental.
    """

    @staticmethod
    def calculate_ecoscore(total_recycled_kg: float, participation_months: int, collections_count: int) -> Dict[str, Any]:
        """
        Calcule l'EcoScore sur 1000.
        Pondération :
        - Quantité recyclée (max 500)
        - Régularité / Participations (max 300)
        - Nombre de collectes validées (max 200)
        """
        # 1 point pour 2 kg, capé à 500
        weight_score = min(500, (total_recycled_kg / 2))
        
        # 30 points par mois de participation, capé à 300
        regularity_score = min(300, participation_months * 30)
        
        # 20 points par collecte, capé à 200
        collections_score = min(200, collections_count * 20)
        
        total_score = int(weight_score + regularity_score + collections_score)
        
        # Déterminer le niveau
        if total_score >= 800:
            level = "PLATINUM"
            next_level_points = 0
            next_reward = "Niveau maximal atteint !"
        elif total_score >= 600:
            level = "GOLD"
            next_level_points = 800 - total_score
            next_reward = f"+{next_level_points} points pour le niveau PLATINUM"
        elif total_score >= 300:
            level = "SILVER"
            next_level_points = 600 - total_score
            next_reward = f"+{next_level_points} points pour le niveau GOLD"
        else:
            level = "BRONZE"
            next_level_points = 300 - total_score
            next_reward = f"+{next_level_points} points pour le niveau SILVER"

        return {
            "score": total_score,
            "max_score": 1000,
            "level": level,
            "next_reward": next_reward,
            "breakdown": {
                "weight_score": int(weight_score),
                "regularity_score": int(regularity_score),
                "collections_score": int(collections_score)
            }
        }

    @staticmethod
    def calculate_equivalences(co2_saved_kg: float) -> Dict[str, Any]:
        """Convertit le CO2 évité en métriques tangibles pour la gamification."""
        # Hypothèses moyennes (à ajuster selon la réalité scientifique)
        # 1 arbre mature absorbe ~25 kg de CO2 par an
        trees_equivalent = int(co2_saved_kg / 25)
        
        # 1 kg de CO2 = environ 4 km en voiture thermique
        km_car_equivalent = int(co2_saved_kg * 4)

        return {
            "trees_planted": trees_equivalent,
            "km_car_avoided": km_car_equivalent
        }
