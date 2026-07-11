"""
Modèle de Détection des Déchets (Object Detection) - EcoLoop AI.

V2 basée sur YOLOv8. Contrairement à la V1 (MobileNetV2) qui ne classifiait
qu'un seul objet, YOLO détecte, encadre et compte de multiples déchets.

Auteur : EcoLoop AI Team

Notes de robustesse (audit 2026-07-11) :
- Charge best.pt (18 classes TACO garbage) par défaut. C'est le modèle qui
  produit des détections réelles (>25% conf). ecoloop_yolo.pt (60 classes)
  est conservé comme fallback car il ne détecte RIEN au seuil 0.25.
- Seuil de confiance configurable via YOLO_CONF_THRESHOLD (défaut 0.10). Le
  défaut 0.25 de YOLO tue toutes les détections du modèle sous-entraîné.
- Mapping explicite par id de classe (pas de heuristique str.lower fragile).
- Conversion RGB + correction EXIF (autofocus / orientation smartphone).
- Crash-proof : image corrompue → renvoie un résultat vide + flag stable
  au lieu d'une exception non gérée qui fait planter le routeur.
"""

import os
import logging
from typing import Optional

from PIL import Image, ImageOps

try:
    from ultralytics import YOLO
except ImportError:  # pragma: no cover
    YOLO = None  # type: ignore
    logging.warning(
        "Librairie 'ultralytics' non installée. "
        "Installez-la avec 'pip install ultralytics'."
    )

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WasteClassifier:
    """
    Détecteur de déchets utilisant YOLOv8.

    Ordre de résolution du modèle (du meilleur au pire) :
      1. best.pt              — 18 classes garbage, détections réelles.
      2. ecoloop_yolo.pt      — 60 classes TACO, fallback (détections très faibles).
      3. yolov8n.pt           — modèle COCO générique (secours réseau).
      4. self.model = None    — aucune IA dispo, predict() gère l'absence.
    """

    CATEGORIES_ECOLOOP = [
        'plastique', 'carton', 'metal', 'verre', 'papier', 'non-recyclable'
    ]

    # ------------------------------------------------------------------ #
    # Mapping EXPLICITE des 18 classes de best.pt (TACO garbage subset)
    # vers les 6 catégories EcoLoop.
    # Source : self.model.names de best.pt (vérifié au runtime).
    # ------------------------------------------------------------------ #
    BEST_CLASS_TO_ECOLOOP = {
        0:  'metal',       # Aluminium foil
        1:  'plastique',   # Bottle cap
        2:  'plastique',   # Bottle
        3:  'verre',       # Broken glass
        4:  'metal',       # Can
        5:  'carton',      # Carton
        6:  'non-recyclable', # Cigarette
        7:  'plastique',   # Cup
        8:  'metal',       # Lid
        9:  'non-recyclable', # Other litter
        10: 'plastique',   # Other plastic
        11: 'papier',      # Paper
        12: 'plastique',   # Plastic bag - wrapper
        13: 'plastique',   # Plastic container
        14: 'metal',       # Pop tab
        15: 'plastique',   # Straw
        16: 'plastique',   # Styrofoam piece
        17: 'non-recyclable', # Unlabeled litter
    }

    # Mapping heuristique de secours
    NAME_KEYWORD_TO_ECOLOOP = [
        (['plastic', 'bottle', 'cup', 'bag', 'wrapper', 'styrofoam',
          'straw', 'wrapper', 'polystyrene'], 'plastique'),
        (['can', 'metal', 'tin', 'aluminum', 'aluminium', 'aerosol',
          'foil', 'pop tab', 'pop-tab'], 'metal'),
        (['glass', 'jar', 'broken glass'], 'verre'),
        (['cardboard', 'carton', 'box'], 'carton'),
        (['paper', 'magazine', 'book'], 'papier'),
        (['food', 'apple', 'orange', 'banana', 'organic', 'fruit', 
          'battery', 'electronic', 'chemical', 'paint', 'cigarette', 
          'litter', 'unlabeled'], 'non-recyclable'),
    ]

    def __init__(self, model_path: Optional[str] = None):
        """
        Initialise le détecteur YOLO.

        Args:
            model_path: Chemin explicite vers un .pt. Si None, résolution
                        automatique : best.pt → ecoloop_yolo.pt → yolov8n.pt.
        """
        # Seuil de confiance : 0.10 par défaut car le modèle best.pt sous-entraîné
        # produit rarement >25%. Configurable par variable d'environnement permet
        # de l'ajuster en production sans redéployer le code.
        self.conf_threshold = float(
            os.environ.get("YOLO_CONF_THRESHOLD", "0.10")
        )
        # Taille d'inférence : 640 est le standard d'entraînement TACO.
        self.imgsz = int(os.environ.get("YOLO_IMGSZ", "640"))

        if YOLO is None:
            logger.error(
                "ultralytics non disponible — WasteClassifier désactivé. "
                "predict() renverra des résultats vides avec fallback."
            )
            self.model = None
            self._using_best = False
            return

        base_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        saved = os.path.join(base_dir, "saved_models")

        # Ordre de résolution explicite.
        candidates = []
        if model_path:
            candidates.append(model_path)
        candidates.extend([
            os.path.join(saved, "best.pt"),
            os.path.join(saved, "ecoloop_yolo.pt"),
        ])

        for path in candidates:
            if path and os.path.exists(path):
                try:
                    self.model = YOLO(path)
                    self._using_best = "best.pt" in os.path.basename(path)
                    logger.info(f"✅ Modèle YOLO chargé : {path}")
                    logger.info(f"   Classes ({len(self.model.names)}): "
                                f"{self.model.names}")
                    logger.info(f"   Conf threshold = {self.conf_threshold}, "
                                f"imgsz = {self.imgsz}")
                    return
                except Exception as e:  # noqa: BLE001
                    logger.warning(f"Échec chargement {path} : {e}")
                    continue

        # Dernier recours : poids COCO générique (téléchargé auto).
        try:
            logger.warning("Aucun .pt local trouvé -> yolov8n.pt (COCO générique).")
            self.model = YOLO("yolov8n.pt")
            self._using_best = False
            logger.info("✅ Modèle YOLO de secours COCO chargé.")
        except Exception as e:  # noqa: BLE001
            logger.error(f"Impossible de charger un modèle YOLO : {e}")
            self.model = None
            self._using_best = False

    # ------------------------------------------------------------------ #
    # Helpers internes
    # ------------------------------------------------------------------ #

    def _map_class_id(self, class_id: int, class_name: str) -> str:
        """
        Mappe un id de classe YOLO vers une catégorie EcoLoop.

        Stratégie :
          1. Si best.pt : table explicite BEST_CLASS_TO_ECOLOOP (fiable).
          2. Sinon : heuristique par mots-clés sur le nom de classe.
          3. Dernier recours : 'autre' (plutôt que 'residuel' trop punitif).
        """
        if self._using_best and class_id in self.BEST_CLASS_TO_ECOLOOP:
            return self.BEST_CLASS_TO_ECOLOOP[class_id]

        name_lower = class_name.lower()
        for keywords, ecoloop_class in self.NAME_KEYWORD_TO_ECOLOOP:
            if any(kw in name_lower for kw in keywords):
                return ecoloop_class
        return 'autre'

    @staticmethod
    def _prepare_image(image):
        """
        Normalise l'entrée image en PIL.Image RGB avec orientation EXIF correcte.

        Accepte : chemin (str), bytes, PIL.Image, numpy array.
        Lève ValueError si l'image est corrompue / illisible.
        """
        if isinstance(image, Image.Image):
            img = image
        elif isinstance(image, (bytes, bytearray)):
            import io
            img = Image.open(io.BytesIO(image))
        elif isinstance(image, str):
            img = Image.open(image)
        elif isinstance(image, (bytes, bytearray)) is False and hasattr(image, 'shape'):
            # numpy array (H, W, C)
            img = Image.fromarray(image)
        else:
            raise ValueError(f"Type d'image non supporté : {type(image)}")

        # Correction orientation EXIF (smartphones tournent les photos).
        img = ImageOps.exif_transpose(img)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        return img

    # ------------------------------------------------------------------ #
    # API publique
    # ------------------------------------------------------------------ #

    def predict(self, image) -> dict:
        """
        Analyse une image pour détecter et compter les déchets.

        Args:
            image: chemin fichier (str), bytes, PIL.Image ou numpy array.

        Returns:
            dict avec :
              - 'total_items' (int)
              - 'items_trouves' (list[dict]) : type, classe_brute, confidence, box_xywh
              - 'resume_quantite' (dict[str, int]) : ex {"plastique": 3, "metal": 1}
              - 'type_dominant' (str) : catégorie majoritaire, "autre" si 0 détection
              - 'fallback_used' (bool) : True si 0 détection (résultat de secours)

        Cette fonction NE LÈVE JAMAIS d'exception pour une image illisible : elle
        renvoie un résultat vide avec fallback_used=True. Les erreurs critiques
        (modèle absent) sont levées explicitement au niveau du routeur.
        """
        # Cas : aucun modèle disponible.
        if self.model is None:
            logger.error("predict() appelé sans modèle chargé.")
            return self._empty_result(fallback_used=True,
                                      reason="Modèle IA non disponible")

        try:
            img = self._prepare_image(image)
        except Exception as e:  # noqa: BLE001
            logger.error(f"Image illisible : {e}")
            return self._empty_result(fallback_used=True,
                                      reason=f"Image illisible : {e}")

        try:
            results = self.model(
                img,
                imgsz=self.imgsz,
                conf=self.conf_threshold,   # <-- LE FIX CLEF
                verbose=False,
            )
        except Exception as e:  # noqa: BLE001
            logger.error(f"Erreur inference YOLO : {e}")
            return self._empty_result(fallback_used=True,
                                      reason=f"Erreur inference : {e}")

        items_trouves = []
        resume_quantite = {}

        for r in results:
            boxes = r.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                class_name = str(self.model.names.get(class_id, f"classe_{class_id}"))
                ecoloop_class = self._map_class_id(class_id, class_name)
                confidence = round(float(box.conf[0]), 4)

                xywh = box.xywh[0].tolist()
                items_trouves.append({
                    "type": ecoloop_class,
                    "classe_brute": class_name,
                    "confidence": confidence,
                    "box_xywh": [round(c, 2) for c in xywh],
                })
                resume_quantite[ecoloop_class] = resume_quantite.get(ecoloop_class, 0) + 1

        total_items = len(items_trouves)

        if total_items == 0:
            logger.warning(
                f"0 détection (conf={self.conf_threshold}). "
                "Retour fallback 'autre'."
            )
            return self._empty_result(fallback_used=True,
                                      reason="Aucun déchet détecté")

        type_dominant = max(resume_quantite, key=resume_quantite.get)

        logger.info(
            f"Prédiction YOLO : {total_items} objets. "
            f"Dominant : {type_dominant}. Conf min utilisée : {self.conf_threshold}"
        )

        return {
            'total_items': total_items,
            'type_dominant': type_dominant,
            'resume_quantite': resume_quantite,
            'items_trouves': items_trouves,
            'fallback_used': False,
        }

    def _empty_result(self, fallback_used: bool, reason: str = "") -> dict:
        """Construit un résultat vide stable (pour crash-proofing)."""
        if fallback_used:
            logger.info(f"Résultat fallback renvoyé. Raison : {reason}")
        return {
            'total_items': 0,
            'type_dominant': 'autre',
            'resume_quantite': {},
            'items_trouves': [],
            'fallback_used': fallback_used,
        }

    def get_categories(self) -> list:
        return self.CATEGORIES_ECOLOOP.copy()