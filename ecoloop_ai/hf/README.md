---
title: EcoLoop AI
emoji: ♻️
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
license: mit
short_description: Classification de déchets, prédiction de prix et détection de fraude
---

# EcoLoop AI

Service IA pour la plateforme EcoLoop :
- Classification des déchets par image (YOLOv8 / MobileNetV2)
- Prédiction des prix des matériaux recyclables (Prophet)
- Prédiction des volumes de collecte (XGBoost)
- Détection de fraude sur les transactions (Isolation Forest)

## API Endpoints

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/health` | GET | Santé du service |
| `/api/classify/` | POST | Classifier un déchet par image |
| `/api/classify/categories` | GET | Catégories supportées |
| `/api/predict/price` | POST | Prédire un prix |
| `/api/predict/volume` | POST | Prédire un volume |
| `/api/fraud/check` | POST | Vérifier une transaction |
