import pytest
import numpy as np
from models.waste_classifier.model import WasteClassifier
from models.waste_classifier.preprocess import preprocess_image, get_recycling_tips


class TestWasteClassifier:
    """Tests unitaires pour le classificateur de déchets."""

    def setup_method(self):
        """Initialisation avant chaque test."""
        self.classifier = WasteClassifier()

    def test_model_creation(self):
        """Vérifie que le modèle est correctement créé."""
        assert self.classifier.model is not None

    def test_categories(self):
        """Vérifie que les catégories de déchets sont complètes."""
        assert len(WasteClassifier.CATEGORIES_ECOLOOP) == 8
        assert 'plastique' in WasteClassifier.CATEGORIES_ECOLOOP

    def test_prediction_format(self):
        """Vérifie le format de sortie de la prédiction."""
        # Pour le test unitaire, créons une fausse image PIL ou un array compatible YOLO.
        # Mais l'idéal est de mocker ou de passer une image valide.
        # YOLO accepte les numpy array : shape (H, W, C) avec H,W >= 32
        fake_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        result = self.classifier.predict(fake_image)
        assert 'total_items' in result
        assert 'type_dominant' in result
        assert 'items_trouves' in result
        assert 'resume_quantite' in result
        if result['type_dominant'] != 'inconnu':
            assert result['type_dominant'] in WasteClassifier.CATEGORIES_ECOLOOP

    def test_recycling_tips(self):
        """Vérifie que chaque catégorie a des conseils de recyclage."""
        for category in WasteClassifier.CATEGORIES_ECOLOOP:
            tip = get_recycling_tips(category)
            assert isinstance(tip, dict)
            assert len(tip) > 0
