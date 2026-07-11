"""
EcoLoop AI - Routes de Classification des Déchets
===================================================

Routeur FastAPI dédié à la classification des déchets par image.

Endpoints :
  POST /api/classify/analyze   — analyse YOLO enrichie (frontend Next.js)
  POST /api/classify/          — alias de /analyze (rétro-compatibilité)
  GET  /api/classify/categories
  POST /api/classify/feedback  — Data Flywheel pour réentraînement

Contrat de réponse (AnalyzeResult) :
  Le frontend Next.js (route.ts) mappe FastApiAnalyzeResult → AnalyseIa.
  Cette route renvoie TOUS les champs attendus par le frontend ET des
  champs de convenance (`category`, `confidence`, `all_scores`) pour les
  clients plus simples. Les deux mondes sont ainsi réconciliés.
"""

import os
import io
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel, Field

from models.waste_classifier.model import WasteClassifier
from models.waste_classifier.preprocess import get_recycling_tips

logger = logging.getLogger("ecoloop_ai.classify")

router = APIRouter(
    prefix="/api/classify",
    tags=["Classification"],
    responses={
        400: {"description": "Requête invalide"},
        413: {"description": "Fichier trop volumineux"},
        500: {"description": "Erreur interne du serveur"},
        503: {"description": "Modèle non disponible"},
    },
)

# ====================================================================
# Constantes
# ====================================================================

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo
SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"}

# Poids estimé moyen (kg) par objet détecté, par catégorie EcoLoop.
# Valeurs empiriques pour des déchets triés en bac — utilisées pour
# l'estimation de volume/poids côté frontend (poids_estime_kg).
WEIGHTS_PER_ITEM_KG = {
    "plastique": 0.050,
    "carton": 0.100,
    "metal":     0.030,
    "verre":     0.350,
    "papier":    0.050,
    "non-recyclable": 0.100,
}

PRIX_MARCHE_FCFA = {
    "plastique": 100,
    "carton": 50,
    "metal": 300,
    "verre": 25,
    "papier": 40,
    "non-recyclable": 0,
}

RECYCLABLE_CATEGORIES = {"plastique", "carton", "metal", "verre", "papier"}

CATEGORIES_DECHETS = [
    {"id": "plastique",  "nom": "Plastique",        "description": "Bouteilles, emballages, sacs plastiques",
     "couleur_poubelle": "Jaune", "recyclable": True},
    {"id": "carton",     "nom": "Carton",           "description": "Cartons d'emballage, boîtes",
     "couleur_poubelle": "Jaune", "recyclable": True},
    {"id": "metal",      "nom": "Métal",            "description": "Canettes, conserves, aluminium",
     "couleur_poubelle": "Jaune", "recyclable": True},
    {"id": "verre",      "nom": "Verre",            "description": "Bouteilles, pots, bocaux en verre",
     "couleur_poubelle": "Vert",  "recyclable": True},
    {"id": "papier",     "nom": "Papier",           "description": "Journaux, magazines, feuilles",
     "couleur_poubelle": "Bleu",  "recyclable": True},
    {"id": "non-recyclable", "nom": "Non Recyclable", "description": "Déchets organiques, dangereux ou résiduels",
     "couleur_poubelle": "Gris/Noir", "recyclable": False},
]


# ====================================================================
# Modèles Pydantic
# ====================================================================

class ItemTrouve(BaseModel):
    type: str
    classe_brute: str
    confidence: float
    box_xywh: list


class AnalyzeResult(BaseModel):
    """Résultat complet d'analyse YOLO (format frontend Next.js + convenance)."""
    # Format simple (clients légers / anciens)
    category: str = Field(..., description="Catégorie dominante (alias de type_dominant)")
    confidence: float = Field(..., description="Confiance moyenne (0.0-1.0)")
    all_scores: dict = Field(default_factory=dict,
                             description="Scores de confiance par catégorie EcoLoop")

    # Format YOLO riche (existant)
    total_items: int = Field(..., description="Nombre total d'objets détectés")
    type_dominant: str = Field(..., description="Catégorie majoritaire dans l'image")
    resume_quantite: dict = Field(..., description="Résumé des quantités par type")
    items_trouves: list[ItemTrouve] = Field(..., description="Détail des objets détectés")

    # Champs enrichis attendus par le frontend Next.js (route.ts)
    etat: str = Field(..., description="État du lot: propre|trie|melange|sale|inconnu")
    score_qualite: float = Field(..., description="Score qualité 0-100")
    poids_estime_kg: float = Field(..., description="Poids total estimé (kg)")
    poids_par_categorie_kg: dict = Field(default_factory=dict,
                                         description="Poids estimé par catégorie")
    volume_estime_m3: float = Field(0.0, description="Volume estimé du lot (m³)")
    collectable: bool = Field(..., description="Le lot est-il collectable/recyclable")
    raison_collectabilite: str = Field("", description="Explication de la collectabilité")
    details_collectabilite: dict = Field(default_factory=dict,
                                         description="Détails pour le collecteur")
    recommandations: list[str] = Field(default_factory=list,
                                       description="Recommandations et instructions pour bien ranger")
    tips: list = Field(default_factory=list,
                       description="Conseils de recyclage pour la catégorie dominante")
    fallback_used: bool = Field(False, description="True si aucune détection nette")
    nom_fichier: Optional[str] = Field(None, description="Nom du fichier original")
    taille_fichier: Optional[int] = Field(None, description="Taille du fichier en octets")
    timestamp: str = Field(..., description="Horodatage ISO-8601")


class CategoriesResponse(BaseModel):
    categories: list = Field(..., description="Liste des catégories de déchets supportées")
    total: int = Field(..., description="Nombre total de catégories")


# Compatibilité : l'ancien modèle ClassificationResult reste un alias.
ClassificationResult = AnalyzeResult


# ====================================================================
# Singleton du classifieur (initialisé dans ai_server.py)
# ====================================================================

_classifier: Optional[WasteClassifier] = None


def get_classifier() -> Optional[WasteClassifier]:
    return _classifier


def set_classifier(classifier: WasteClassifier) -> None:
    global _classifier
    _classifier = classifier


# ====================================================================
# Logique d'enrichissement
# ====================================================================

def _compute_all_scores(items_trouves: list[dict]) -> dict:
    """Retourne la confidence moyenne par catégorie EcoLoop (format all_scores)."""
    scores: dict[str, list[float]] = {}
    for it in items_trouves:
        scores.setdefault(it["type"], []).append(it["confidence"])
    return {cat: round(sum(v) / len(v), 4) for cat, v in scores.items()}


def _estimate_weights(resume_quantite: dict) -> tuple[float, dict, float]:
    """Estime le poids total, le poids par catégorie, et le volume (m3)."""
    poids_par_cat = {}
    total_poids = 0.0
    total_volume = 0.0
    for cat, qte in resume_quantite.items():
        unitaire = WEIGHTS_PER_ITEM_KG.get(cat, 0.05)
        poids_cat = round(unitaire * qte, 3)
        poids_par_cat[cat] = poids_cat
        total_poids += poids_cat
        
        # Heuristique basique de volume par objet
        vol_unitaire = 0.01 # 10 litres par défaut
        if cat == "plastique": vol_unitaire = 0.015
        elif cat == "verre": vol_unitaire = 0.002
        elif cat == "carton": vol_unitaire = 0.03
        total_volume += vol_unitaire * qte

    return round(total_poids, 3), poids_par_cat, round(total_volume, 3)


def _compute_score_qualite(items_trouves: list[dict],
                           resume_quantite: dict,
                           type_dominant: str,
                           fallback_used: bool) -> float:
    """
    Score qualité 0-100 :
      base = confiance moyenne * 100
      + bonus homogénéité (catégories peu nombreuses)
      + bonus recyclabilité de la catégorie dominante
      - pénalité présence de résiduel / dangereux
    """
    if fallback_used or not items_trouves:
        return 0.0

    confs = [it["confidence"] for it in items_trouves]
    avg_conf = sum(confs) / len(confs)
    score = avg_conf * 100.0  # base : un modèle à 30% de conf → 30/100

    nb_cat = len(resume_quantite)
    if nb_cat == 1:
        score += 15.0  # lot homogène
    elif nb_cat == 2:
        score += 5.0

    if type_dominant in RECYCLABLE_CATEGORIES:
        score += 10.0

    score -= 5.0 * resume_quantite.get("residuel", 0)
    score -= 5.0 * resume_quantite.get("autre", 0)
    if resume_quantite.get("dangereux", 0) > 0:
        score -= 15.0

    return round(max(0.0, min(100.0, score)), 1)


def _compute_etat(resume_quantite: dict, type_dominant: str,
                  fallback_used: bool, score_qualite: float) -> str:
    if fallback_used or not resume_quantite:
        return "inconnu"
    nb_cat = len(resume_quantite)
    if type_dominant == "dangereux":
        return "inconnu"
    if nb_cat == 1 and type_dominant in RECYCLABLE_CATEGORIES and score_qualite >= 60:
        return "propre"
    if nb_cat <= 2 and all(c in RECYCLABLE_CATEGORIES for c in resume_quantite):
        return "trie"
    if type_dominant == "residuel":
        return "sale"
    return "melange"


def _compute_collectable(type_dominant: str, resume_quantite: dict,
                          items_trouves: list[dict], score_qualite: float):
    """
    Décide de la collectabilité et produit une raison + détails.
    """
    total = len(items_trouves)
    if total == 0:
        return False, "Aucun objet détecté, lot non évaluable.", {"reason": "empty"}

    if resume_quantite.get("dangereux", 0) > 0:
        return False, "Présence de déchet dangereux : collecte spécialisée requise.", \
            {"reason": "dangerous_present",
             "dangereux_count": resume_quantite.get("dangereux", 0)}

    if type_dominant in ("residuel", "autre") and score_qualite < 40:
        return False, "Lot dominé par du résiduel peu triable.", \
            {"reason": "residual_dominant"}

    recyclable_count = sum(resume_quantite.get(c, 0) for c in RECYCLABLE_CATEGORIES)
    if recyclable_count == 0:
        return False, "Aucune catégorie recyclable détectée.", {"reason": "no_recyclable"}

    contamination = resume_quantite.get("residuel", 0) + resume_quantite.get("autre", 0)
    return contamination == 0, ("Lot recyclable sans contamination apparente."
                                if contamination == 0
                                else "Lot recyclable avec une légère contamination résiduelle."), \
        {"reason": "ok" if contamination == 0 else "ok_with_residue",
         "recyclable_count": recyclable_count,
         "contamination": contamination}


def _build_recommandations(type_dominant: str, resume_quantite: dict) -> list[str]:
    """Recommandations de tri simples, basées sur la catégorie dominante."""
    recs = []
    base = {
        "plastique": "Déposez les emballages plastiques dans la poubelle jaune après rinçage.",
        "metal":     "Les métaux (canettes, conserves) vont dans la poubelle jaune.",
        "verre":     "Déposez le verre dans le conteneur à verre (vert), sans bouchon.",
        "papier":    "Aplatissez les cartons et déposez-les dans le bac bleu / jaune.",
        "organique": "Placez les biodéchets dans le composteur ou la poubelle marron.",
        "dangereux":  "Déposez les déchets dangereux en déchèterie (ne pas mélanger).",
        "residuel":  "Lot résiduel : direction la poubelle grise/noire (ordures ménagères).",
        "autre":     "Catégorie incertaine : en cas de doute, poubelle résiduelle.",
    }
    if type_dominant in base:
        recs.append(base[type_dominant])
    if resume_quantite.get("dangereux", 0) > 0:
        recs.append("⚠️ Déchet dangereux détecté : isolez-le pour une collecte spécialisée.")
    if len(resume_quantite) >= 3:
        recs.append("Lot mélangé : un pré-tri améliorera le score de qualité.")
    if not recs:
        recs.append("Analysez de nouveau avec une image plus nette pour un meilleur diagnostic.")
    return recs


def _tips_as_list(tips_obj) -> list:
    """
    get_recycling_tips renvoie un dict (avec clés 'conseils', 'poubelle', ...).
    Le frontend attend la liste 'conseils'. On extrait uniquement ça.
    """
    if isinstance(tips_obj, dict):
        return list(tips_obj.get("conseils", []))
    if isinstance(tips_obj, list):
        return tips_obj
    return []


# ====================================================================
# Endpoints
# ====================================================================

def _analyze_bytes(contents: bytes, filename: Optional[str],
                   file_size: int) -> AnalyzeResult:
    """
    Pipeline central d'analyse (utilisé par /analyze et /).
    Ne lève jamais pour un problème d'image : renvoie un fallback.
    Ne lève jamais pour un problème de modèle : renvoie un fallback.
    Lève HTTPException(400/503) uniquement pour des erreurs client/infra.
    """
    classifier = get_classifier()
    if classifier is None:
        raise HTTPException(
            status_code=503,
            detail={"erreur": "Modèle IA non chargé",
                    "message": "Le service de classification est indisponible."}
        )

    result = classifier.predict(contents)  # crash-proof : ne lève pas

    total_items = result.get("total_items", 0)
    type_dominant = result.get("type_dominant", "autre")
    resume_quantite = result.get("resume_quantite", {})
    items_trouves_raw = result.get("items_trouves", [])
    fallback_used = result.get("fallback_used", False)

    items_trouves = [ItemTrouve(**it) for it in items_trouves_raw]

    # Enrichissements
    all_scores = _compute_all_scores(items_trouves_raw)
    confidence_avg = (round(sum(it.confidence for it in items_trouves) / len(items_trouves), 4)
                      if items_trouves else 0.0)
    poids_total, poids_par_cat, volume_total = _estimate_weights(resume_quantite)
    score_qualite = _compute_score_qualite(items_trouves_raw, resume_quantite,
                                           type_dominant, fallback_used)
    etat = _compute_etat(resume_quantite, type_dominant, fallback_used, score_qualite)
    collectable, raison, details = _compute_collectable(type_dominant, resume_quantite,
                                                        items_trouves_raw, score_qualite)
    recommandations = _build_recommandations(type_dominant, resume_quantite)
    tips_list = _tips_as_list(get_recycling_tips(type_dominant))

    return AnalyzeResult(
        category=type_dominant,
        confidence=confidence_avg,
        all_scores=all_scores,
        total_items=total_items,
        type_dominant=type_dominant,
        resume_quantite=resume_quantite,
        items_trouves=items_trouves,
        etat=etat,
        score_qualite=score_qualite,
        poids_estime_kg=poids_total,
        poids_par_categorie_kg=poids_par_cat,
        volume_estime_m3=volume_total,
        collectable=collectable,
        raison_collectabilite=raison,
        details_collectabilite=details,
        recommandations=recommandations,
        tips=tips_list,
        fallback_used=fallback_used,
        nom_fichier=filename,
        taille_fichier=file_size,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.post(
    "/analyze",
    response_model=AnalyzeResult,
    summary="Analyser une image de déchets (YOLO + enrichissement)",
    description="Endpoint principal consommé par le frontend Next.js. "
                "Renvoie le format complet AnalyzeResult (Items, score qualité, "
                "poids estimé, collectabilité, recommandations, tips, fallback).",
)
async def classify_analyze(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    # On reste permissif : certains clients n'envoient pas un content-type correct.
    # On valide la taille, et on laisse YOLO échouer gracieusement si pas une image.
    try:
        contents = await file.read()
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400,
                            detail=f"Lecture du fichier impossible : {e}")

    file_size = len(contents)
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Fichier vide.")
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (>10 Mo).")

    try:
        return _analyze_bytes(contents, file.filename, file_size)
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        logger.error(f"Erreur inattendue lors de l'analyse : {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"erreur": "Erreur interne",
                    "message": f"Une erreur est survenue : {e}"}
        )


@router.post(
    "/",
    response_model=AnalyzeResult,
    summary="Alias POST / de /api/classify (rétro-compatibilité)",
    include_in_schema=False,
)
async def classify_alias(file: UploadFile = File(...)):
    return await classify_analyze(file)


@router.get(
    "/categories",
    response_model=CategoriesResponse,
    summary="Lister les catégories de déchets",
)
async def get_categories():
    return CategoriesResponse(categories=CATEGORIES_DECHETS, total=len(CATEGORIES_DECHETS))


@router.post(
    "/feedback",
    summary="[Data Flywheel] Sauvegarder une correction utilisateur",
    description="Sauvegarde une image corrigée par un utilisateur pour le futur réentraînement.",
)
async def submit_feedback(
    file: UploadFile = File(...),
    correct_category: str = Form(...),
):
    try:
        base_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        feedback_dir = os.path.join(base_dir, "data", "feedback", correct_category.lower())
        os.makedirs(feedback_dir, exist_ok=True)

        from uuid import uuid4
        import shutil
        filename = f"{uuid4().hex}_{file.filename}"
        filepath = os.path.join(feedback_dir, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"status": "success",
                "message": f"Feedback enregistré pour réentraînement. "
                           f"Image sauvée dans {correct_category}"}
    except Exception as e:  # noqa: BLE001
        logger.error(f"Erreur lors de la sauvegarde du feedback : {e}")
        raise HTTPException(status_code=500,
                            detail="Impossible de sauvegarder le feedback.")