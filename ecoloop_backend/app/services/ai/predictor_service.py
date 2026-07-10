import uuid
import random
from typing import Dict, Any, List

class ZonePredictorService:
    """
    Service IA qui évalue le risque de saturation des zones (Mock robuste).
    Prend en compte l'historique, la population et la météo (simulés pour la démo).
    """

    @staticmethod
    async def analyze_zone_risk(zone_name: str, population: int, historical_waste_kg: float) -> Dict[str, Any]:
        """
        Analyse une zone et retourne une prédiction structurée.
        """
        # Simulation d'un modèle heuristique complexe
        base_risk = min(80, (historical_waste_kg / max(1, population)) * 100)
        
        # Facteur aléatoire contrôlé pour donner un aspect "vivant" à la démo
        random_factor = random.uniform(-10, 20)
        risk_score = min(98, max(12, base_risk + random_factor))
        confidence = random.uniform(85, 96)
        
        reasons = []
        if risk_score > 70:
            reasons.append(f"Volume de déchets élevé (+{int(random.uniform(15, 45))}% cette semaine)")
        if population > 20000:
            reasons.append("Forte densité de population dans la zone")
        if risk_score > 80:
            reasons.append("Capacité de collecte actuelle insuffisante (-20%)")
        if random.random() > 0.7:
            reasons.append("Conditions météo défavorables (Pluie prévue)")

        if not reasons:
            reasons.append("Volume stable, aucune anomalie détectée.")

        action = "Aucune action requise"
        priority = "LOW"
        if risk_score > 85:
            action = "Ajouter 2 collecteurs d'urgence"
            priority = "URGENT"
        elif risk_score > 60:
            action = "Augmenter la fréquence de collecte de 30%"
            priority = "HIGH"

        return {
            "prediction_id": str(uuid.uuid4()),
            "zone": zone_name,
            "risk_score": round(risk_score, 1),
            "confidence": round(confidence, 1),
            "trend": "up" if risk_score > 60 else "stable",
            "expected_volume_increase_percent": round(random.uniform(5, 40), 1) if risk_score > 60 else 0,
            "reasons": reasons,
            "recommendation": {
                "action": action,
                "priority": priority,
                "estimated_impact": "-30% d'accumulation de déchets" if risk_score > 60 else None
            }
        }
