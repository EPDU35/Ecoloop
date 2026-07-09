"""Tests unitaires pour le module de détection de fraude."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.fraud_detection.fraud_model import FraudDetector


class TestFraudDetector:
    """Tests pour la classe FraudDetector."""
    
    def setup_method(self):
        self.detector = FraudDetector()
    
    def test_creation(self):
        """Vérifie l'instanciation du détecteur."""
        assert self.detector is not None
    
    def test_risk_levels(self):
        """Vérifie les niveaux de risque."""
        assert len(FraudDetector.RISK_LEVELS) == 3
        assert 'normal' in FraudDetector.RISK_LEVELS
        assert 'suspect' in FraudDetector.RISK_LEVELS
        assert 'fraude' in FraudDetector.RISK_LEVELS
    
    def test_risk_level_assignment(self):
        """Vérifie l'attribution des niveaux de risque."""
        assert self.detector._get_risk_level(10) == 'normal'
        assert self.detector._get_risk_level(50) == 'suspect'
        assert self.detector._get_risk_level(80) == 'fraude'
    
    def test_identify_reasons_high_weight(self):
        """Vérifie la détection de poids anormal."""
        transaction = {'poids': 5000, 'prix': 100, 'heure': 14}
        reasons = self.detector._identify_reasons(transaction, 60)
        assert any('poids' in r.lower() for r in reasons)
    
    def test_identify_reasons_unusual_hour(self):
        """Vérifie la détection d'heure inhabituelle."""
        transaction = {'poids': 50, 'prix': 100, 'heure': 3}
        reasons = self.detector._identify_reasons(transaction, 60)
        assert any('heure' in r.lower() for r in reasons)
    
    def test_normal_transaction(self):
        """Teste une transaction normale si le modèle est chargé."""
        if self.detector.model is not None:
            transaction = {'poids': 50, 'prix': 100, 'heure': 14, 'jour_semaine': 2}
            result = self.detector.check_transaction(transaction)
            assert 'risk_score' in result
            assert 'risk_level' in result
            assert 'reasons' in result
