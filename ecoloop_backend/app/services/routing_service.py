"""
Optimisation de tournée pour un collecteur ayant plusieurs lots réservés.

Implémentation MVP : heuristique du plus proche voisin (rapide, suffisante pour
quelques dizaines de points). Évolution prévue (dossier technique) : OR-Tools
pour une optimisation combinatoire complète (VRP) quand le volume augmentera.
"""
from app.services.matching_service import haversine_distance_km


def optimize_route(
    start: tuple[float, float],
    stops: list[dict],
) -> list[dict]:
    """
    stops : liste de dicts contenant au minimum {"id": ..., "latitude": ..., "longitude": ...}
    Retourne les mêmes dicts, réordonnés selon un parcours glouton au plus proche voisin.
    """
    remaining = stops.copy()
    ordered: list[dict] = []
    current_lat, current_lon = start

    while remaining:
        nearest = min(
            remaining,
            key=lambda s: haversine_distance_km(current_lat, current_lon, s["latitude"], s["longitude"]),
        )
        ordered.append(nearest)
        current_lat, current_lon = nearest["latitude"], nearest["longitude"]
        remaining.remove(nearest)

    return ordered
