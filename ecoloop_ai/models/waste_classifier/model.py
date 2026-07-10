"""
Modèle de Détection des Déchets (Object Detection) - EcoLoop AI.

Ce module implémente la V2 de l'Intelligence Artificielle d'EcoLoop, 
basée sur l'algorithme ultrarapide YOLOv8 (You Only Look Once).
Contrairement à la V1 (MobileNetV2) qui ne classifiait qu'un seul objet, 
YOLO peut trouver, encadrer et compter de multiples déchets mélangés dans une poubelle.

Auteur : EcoLoop AI Team
"""

import os
import logging
from PIL import Image
import numpy as np

try:
    from ultralytics import YOLO
except ImportError:
    logging.warning("Librairie 'ultralytics' non installée. Installez-la avec 'pip install ultralytics'")

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WasteClassifier:
    """
    Détecteur de déchets utilisant YOLOv8.
    """

    # Liste des catégories que le TACO Dataset reconnaît (simplifié pour EcoLoop)
    # YOLO renvoie l'ID de la classe, nous ferons la correspondance ici.
    CATEGORIES_ECOLOOP = ['plastique', 'metal', 'verre', 'papier', 'organique', 'dangereux', 'residuel', 'autre']

    def __init__(self, model_path: str = None):
        """
        Initialise le détecteur YOLO.
        """
        if model_path is None:
            # Chemin absolu basé sur l'emplacement de ce fichier
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(base_dir, "saved_models", "ecoloop_yolo.pt")

        if os.path.exists(model_path):
            self.model = YOLO(model_path)
            logger.info(f"✅ Modèle YOLO EcoLoop chargé depuis : {model_path}")
        else:
            logger.warning(f"⚠️ Fichier {model_path} introuvable.")
            logger.info("⏳ Chargement du modèle de secours YOLOv8n pré-entraîné (reconnaissance basique)...")
            # YOLO téléchargera automatiquement les poids génériques COCO s'il ne les trouve pas
            self.model = YOLO("yolov8n.pt")
            logger.info("✅ Modèle YOLO de secours chargé.")

    def predict(self, image) -> dict:
        """
        Analyse une image pour détecter et compter tous les déchets.

        Args:
            image: Image d'entrée sous forme de chemin de fichier, objet PIL Image ou numpy array.

        Returns:
            dict: Dictionnaire contenant :
                - 'total_items' (int): Nombre total de déchets détectés.
                - 'items_trouves' (list): Liste des objets avec leur type, confiance, et coordonnées (x,y,w,h).
                - 'resume_quantite' (dict): Ex: {"plastique": 3, "metal": 1}.
                - 'type_dominant' (str): La catégorie majoritaire dans l'image.
        """
        try:
            # Effectuer la prédiction avec YOLO (imgsz=640 est standard)
            results = self.model(image, imgsz=640, verbose=False)
            
            items_trouves = []
            resume_quantite = {}
            
            # YOLO renvoie une liste de résultats (un par image d'entrée)
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # Extraire la classe (0, 1, 2...)
                    class_id = int(box.cls[0])
                    # Extraire le nom de la classe
                    class_name = self.model.names[class_id]
                    
                    # --- MAPPING NIVEAU 99 : Dataset TACO vers EcoLoop ---
                    name_lower = class_name.lower()
                    
                    if any(x in name_lower for x in ['plastic', 'bottle', 'cup', 'bag', 'wrapper', 'styrofoam']):
                        ecoloop_class = 'plastique'
                    elif any(x in name_lower for x in ['can', 'metal', 'tin', 'aluminum', 'aerosol']):
                        ecoloop_class = 'metal'
                    elif any(x in name_lower for x in ['glass', 'jar']):
                        ecoloop_class = 'verre'
                    elif any(x in name_lower for x in ['paper', 'cardboard', 'carton', 'magazine', 'book', 'box']):
                        ecoloop_class = 'papier'
                    elif any(x in name_lower for x in ['food', 'apple', 'orange', 'banana', 'organic', 'fruit']):
                        ecoloop_class = 'organique'
                    elif any(x in name_lower for x in ['battery', 'electronic', 'chemical']):
                        ecoloop_class = 'dangereux'
                    else:
                        ecoloop_class = 'residuel'
                        
                    # Confiance
                    confidence = float(box.conf[0])
                    
                    # Coordonnées du cadre (Bounding Box) : x_center, y_center, width, height
                    xywh = box.xywh[0].tolist()
                    
                    items_trouves.append({
                        "type": ecoloop_class,
                        "classe_brute": class_name,
                        "confidence": round(confidence, 2),
                        "box_xywh": [round(c, 2) for c in xywh]
                    })
                    
                    # Mettre à jour le résumé
                    resume_quantite[ecoloop_class] = resume_quantite.get(ecoloop_class, 0) + 1

            # Calculer le type dominant
            type_dominant = "inconnu"
            if resume_quantite:
                type_dominant = max(resume_quantite, key=resume_quantite.get)

            result = {
                'total_items': len(items_trouves),
                'type_dominant': type_dominant,
                'resume_quantite': resume_quantite,
                'items_trouves': items_trouves
            }

            logger.info(f"Prédiction YOLO : {len(items_trouves)} objets trouvés. Dominant : {type_dominant}")
            return result

        except Exception as e:
            logger.error(f"Erreur lors de la prédiction YOLO : {str(e)}")
            raise ValueError(f"Impossible d'analyser l'image avec YOLO : {str(e)}")

    def get_categories(self) -> list:
        return self.CATEGORIES_ECOLOOP.copy()
