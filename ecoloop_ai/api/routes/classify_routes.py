"""
EcoLoop AI - Routes de Classification des Déchets
===================================================

Routeur FastAPI dédié à la classification des déchets par image.
Fournit les endpoints pour :
- Classifier un déchet à partir d'une image uploadée
- Lister les catégories de déchets disponibles

Préfixe : /api/classify
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel, Field

# --- Import des modules de classification ---
from models.waste_classifier.model import WasteClassifier
from models.waste_classifier.preprocess import preprocess_image, get_recycling_tips

# --- Configuration du logging ---
logger = logging.getLogger("ecoloop_ai.classify")

# --- Création du routeur ---
router = APIRouter(
    prefix="/api/classify",
    tags=["Classification"],
    responses={
        400: {"description": "Requête invalide"},
        413: {"description": "Fichier trop volumineux"},
        500: {"description": "Erreur interne du serveur"},
        503: {"description": "Modèle non disponible"},
    }
)

# --- Constantes ---
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo en octets
SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"}

# Catégories de déchets supportées par le classificateur
CATEGORIES_DECHETS = [
    {
        "id": "plastique",
        "nom": "Plastique",
        "description": "Bouteilles, emballages, sacs plastiques",
        "couleur_poubelle": "Jaune",
        "recyclable": True
    },
    {
        "id": "verre",
        "nom": "Verre",
        "description": "Bouteilles, pots, bocaux en verre",
        "couleur_poubelle": "Vert",
        "recyclable": True
    },
    {
        "id": "papier",
        "nom": "Papier / Carton",
        "description": "Journaux, magazines, cartons d'emballage",
        "couleur_poubelle": "Bleu",
        "recyclable": True
    },
    {
        "id": "metal",
        "nom": "Métal",
        "description": "Canettes, conserves, aluminium",
        "couleur_poubelle": "Jaune",
        "recyclable": True
    },
    {
        "id": "organique",
        "nom": "Organique",
        "description": "Restes alimentaires, épluchures, déchets verts",
        "couleur_poubelle": "Marron",
        "recyclable": False
    },
    {
        "id": "textile",
        "nom": "Textile",
        "description": "Vêtements, tissus, chaussures",
        "couleur_poubelle": "Conteneur spécifique",
        "recyclable": True
    },
    {
        "id": "electronique",
        "nom": "Électronique (DEEE)",
        "description": "Appareils électriques, piles, batteries",
        "couleur_poubelle": "Déchèterie",
        "recyclable": True
    },
    {
        "id": "dangereux",
        "nom": "Dangereux",
        "description": "Produits chimiques, peintures, solvants",
        "couleur_poubelle": "Déchèterie",
        "recyclable": False
    },
    {
        "id": "residuel",
        "nom": "Résiduel",
        "description": "Déchets non recyclables, ordures ménagères",
        "couleur_poubelle": "Gris/Noir",
        "recyclable": False
    }
]


# =============================================================================
# Modèles Pydantic
# =============================================================================

class ItemTrouve(BaseModel):
    type: str
    classe_brute: str
    confidence: float
    box_xywh: list

class ClassificationResult(BaseModel):
    """Résultat de classification d'un déchet par YOLO."""
    total_items: int = Field(..., description="Nombre total d'objets détectés")
    type_dominant: str = Field(..., description="Catégorie majoritaire dans l'image")
    resume_quantite: dict = Field(..., description="Résumé des quantités par type")
    items_trouves: list[ItemTrouve] = Field(..., description="Détail des objets détectés")
    tips: list = Field(default=[], description="Conseils de recyclage pour la catégorie dominante")
    nom_fichier: Optional[str] = Field(None, description="Nom du fichier original")
    taille_fichier: Optional[int] = Field(None, description="Taille du fichier en octets")
    timestamp: str = Field(..., description="Horodatage de la classification")

class CategoriesResponse(BaseModel):
    """Réponse contenant la liste des catégories de déchets."""
    categories: list = Field(..., description="Liste des catégories de déchets supportées")
    total: int = Field(..., description="Nombre total de catégories")

# =============================================================================
# Variable globale pour le modèle (initialisé dans ai_server.py)
# =============================================================================

_classifier: Optional[WasteClassifier] = None

def get_classifier() -> Optional[WasteClassifier]:
    return _classifier

def set_classifier(classifier: WasteClassifier) -> None:
    global _classifier
    _classifier = classifier

# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/",
    response_model=ClassificationResult,
    summary="Détecter les déchets avec YOLO",
    description="Analyse une image de déchets avec YOLOv8 pour détecter de multiples objets."
)
async def classify_image(
    file: UploadFile = File(...)
):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Veuillez envoyer une image valide.")

    try:
        contents = await file.read()
        file_size = len(contents)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Fichier trop volumineux.")

        classifier = get_classifier()
        if classifier is None:
            raise HTTPException(status_code=503, detail="Modèle non disponible.")

        # YOLO lit directement l'image binaire via PIL, pas besoin de preprocess_image de MobileNet
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(contents))

        # --- Classification YOLO ---
        result = classifier.predict(image)

        # --- Récupération des conseils de recyclage pour le type dominant ---
        type_dominant = result.get("type_dominant", "inconnu")
        tips = get_recycling_tips(type_dominant)

        return ClassificationResult(
            total_items=result.get("total_items", 0),
            type_dominant=type_dominant,
            resume_quantite=result.get("resume_quantite", {}),
            items_trouves=result.get("items_trouves", []),
            tips=tips,
            nom_fichier=file.filename,
            taille_fichier=file_size,
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        # Re-lever les HTTPException sans modification
        raise
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la classification : {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "erreur": "Erreur interne",
                "message": f"Une erreur est survenue lors de la classification : {str(e)}"
            }
        )


@router.get(
    "/categories",
    response_model=CategoriesResponse,
    summary="Lister les catégories de déchets",
    description="Retourne la liste complète des catégories de déchets supportées par le classificateur."
)
async def get_categories():
    """
    Retourne la liste de toutes les catégories de déchets supportées.
    
    Chaque catégorie contient :
    - id : identifiant unique
    - nom : nom affiché
    - description : description de la catégorie
    - couleur_poubelle : couleur de la poubelle associée
    - recyclable : indique si la catégorie est recyclable
    """
    return CategoriesResponse(
        categories=CATEGORIES_DECHETS,
        total=len(CATEGORIES_DECHETS)
    )

import os
import shutil
from fastapi import Form

@router.post(
    "/feedback",
    summary="[Data Flywheel] Sauvegarder une correction utilisateur",
    description="Sauvegarde une image corrigée par un utilisateur pour le futur réentraînement de l'IA."
)
async def submit_feedback(
    file: UploadFile = File(...),
    correct_category: str = Form(...)
):
    """
    Si l'IA se trompe, l'utilisateur envoie l'image avec la VRAIE catégorie.
    L'image est sauvegardée dans le dossier 'data/feedback/categorie' pour un futur réentraînement.
    """
    try:
        # Créer le dossier s'il n'existe pas
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        feedback_dir = os.path.join(base_dir, "data", "feedback", correct_category.lower())
        os.makedirs(feedback_dir, exist_ok=True)
        
        # Générer un nom unique
        from uuid import uuid4
        filename = f"{uuid4().hex}_{file.filename}"
        filepath = os.path.join(feedback_dir, filename)
        
        # Sauvegarder l'image
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"status": "success", "message": f"Feedback enregistré pour réentraînement. Image sauvée dans {correct_category}"}
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde du feedback : {e}")
        raise HTTPException(status_code=500, detail="Impossible de sauvegarder le feedback.")

