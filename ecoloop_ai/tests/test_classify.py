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
        assert len(WasteClassifier.CATEGORIES) == 6
        assert 'plastique' in WasteClassifier.CATEGORIES

    def test_prediction_format(self):
        """Vérifie le format de sortie de la prédiction."""
        fake_image = np.random.rand(224, 224, 3).astype(np.float32)
        result = self.classifier.predict(fake_image)
        assert 'type' in result
        assert 'confidence' in result
        assert result['type'] in WasteClassifier.CATEGORIES
        assert 0 <= result['confidence'] <= 1

    def test_recycling_tips(self):
        """Vérifie que chaque catégorie a des conseils de recyclage."""
        for category in WasteClassifier.CATEGORIES:
            tip = get_recycling_tips(category)
            assert isinstance(tip, dict)
            assert len(tip) > 0
