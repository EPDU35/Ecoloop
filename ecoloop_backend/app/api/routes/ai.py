from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.services.ai.predictor_service import ZonePredictorService
from app.services.ai.matching_service import MatchingService
from app.services.ai.impact_service import ImpactService
from app.middlewares.jwt import get_current_user
from app.models.user import User

router = APIRouter()

class ZoneRiskRequest(BaseModel):
    zone: str
    population: int = 50000
    historical_waste_kg: float = 2000.0

class Collector(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    capacity_kg: float
    is_available: bool = True
    rating: float = 4.5

class MatchRequest(BaseModel):
    lot_lat: float
    lot_lon: float
    lot_weight_kg: float
    collectors: List[Collector]

class ImpactRequest(BaseModel):
    total_recycled_kg: float
    participation_months: int
    collections_count: int

@router.post("/zones-risk", summary="Prédiction IA du risque de saturation des zones")
async def predict_zone_risk(req: ZoneRiskRequest, current_user: User = Depends(get_current_user)):
    """
    Évalue le risque de saturation d'une zone et propose des recommandations.
    """
    # Dans un cas réel, ces données (population, historique) viendraient de la DB via les tables `zones` et `waste_events`.
    prediction = await ZonePredictorService.analyze_zone_risk(req.zone, req.population, req.historical_waste_kg)
    return {"status": "success", "data": prediction}

@router.post("/match-collector", summary="Scoring et matching IA des collecteurs")
async def match_collector(req: MatchRequest, current_user: User = Depends(get_current_user)):
    """
    Score une liste de collecteurs pour un lot donné.
    """
    collectors_dict = [c.dict() for c in req.collectors]
    results = await MatchingService.get_best_collectors(
        req.lot_lat, req.lot_lon, req.lot_weight_kg, collectors_dict
    )
    return {"status": "success", "data": {"matches": results}}

@router.post("/impact", summary="Calcul de l'EcoScore et Impact")
async def get_impact(req: ImpactRequest, current_user: User = Depends(get_current_user)):
    """
    Calcule l'EcoScore d'un producteur et les équivalences écologiques.
    """
    ecoscore = ImpactService.calculate_ecoscore(
        req.total_recycled_kg, req.participation_months, req.collections_count
    )
    
    # 1 kg de déchets recyclés = ~0.3 kg de CO2 évité en moyenne (simplifié)
    co2_saved = req.total_recycled_kg * 0.3
    equivalences = ImpactService.calculate_equivalences(co2_saved)
    
    return {
        "status": "success",
        "data": {
            "ecoscore": ecoscore,
            "impact": {
                "co2_saved_kg": round(co2_saved, 1),
                **equivalences
            }
        }
    }
