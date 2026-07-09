import pytest
import pandas as pd
import numpy as np
from models.prediction.price_prediction import PricePredictor
from models.prediction.volume_prediction import VolumePredictor


class TestPricePredictor:
    """Tests unitaires pour le prédicteur de prix."""

    def setup_method(self):
        """Initialisation avant chaque test."""
        self.predictor = PricePredictor()

    def test_price_predictor_creation(self):
        """Vérifie que le prédicteur de prix est correctement instancié."""
        assert self.predictor is not None

    def test_price_materials(self):
        """Vérifie que la liste des matériaux contient 4 éléments."""
        assert len(PricePredictor.MATERIALS) == 4

    def test_price_prediction_format(self):
        """Vérifie le format de sortie de la prédiction de prix."""
        # Ne tester que si les modèles sont chargés
        if self.predictor.models:
            for material in PricePredictor.MATERIALS:
                if material in self.predictor.models:
                    result = self.predictor.predict(material, periods=7)
                    assert isinstance(result, dict)
                    assert 'predictions' in result
                    assert 'material' in result


class TestVolumePredictor:
    """Tests unitaires pour le prédicteur de volumes."""

    def setup_method(self):
        """Initialisation avant chaque test."""
        self.predictor = VolumePredictor()

    def test_volume_predictor_creation(self):
        """Vérifie que le prédicteur de volumes est correctement instancié."""
        assert self.predictor is not None

    def test_volume_feature_creation(self):
        """Vérifie que _create_features retourne les colonnes attendues."""
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        df = pd.DataFrame({
            'date': dates,
            'volume': np.random.rand(30) * 100
        })
        features = self.predictor._create_features(df)
        expected_columns = ['day_of_week', 'month', 'day_of_month', 'is_weekend']
        for col in expected_columns:
            assert col in features.columns, f"Colonne '{col}' manquante dans les features"
