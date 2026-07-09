# 🌍 EcoLoop AI — Module Intelligence Artificielle

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13+-orange?logo=tensorflow)
![Docker](https://img.shields.io/badge/Docker-24+-blue?logo=docker)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.3+-yellow?logo=scikit-learn)

Module d'Intelligence Artificielle de la plateforme **EcoLoop**, une solution de recyclage intelligente.

## 📖 Description

Ce microservice Python/FastAPI fournit 4 fonctionnalités IA :

| Fonctionnalité | Modèle | Métrique cible |
|---|---|---|
| Classification des déchets par image | MobileNetV2 (transfer learning) | Accuracy ≥ 85% |
| Prédiction des prix des matériaux | Prophet (Facebook) | MAPE < 15% |
| Prédiction des volumes de collecte | XGBoost | MAE < 10% |
| Détection de fraude transactionnelle | Isolation Forest | F1-score > 80% |

## 🏗️ Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  App Flutter  │────▶│ Backend Node.js │────▶│  API IA (FastAPI) │
│  (Mobile)     │     │ (Express)       │     │  (Python)         │
└──────────────┘     └─────────────────┘     └──────────────────┘
                                                       │
                                              ┌────────┼────────┐
                                              ▼        ▼        ▼
                                         [Classif.] [Prédict.] [Fraude]
                                              │        │        │
                                              ▼        ▼        ▼
                                         [saved_models/  →  .h5, .pkl]
```

## 🚀 Démarrage rapide

### Prérequis

- Python 3.10+
- Docker 24+ (optionnel, pour le déploiement)

### Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd ecoloop_ai

# Installer les dépendances
pip install -r requirements.txt
```

### Génération des données synthétiques

```bash
python scripts/generate_synthetic_data.py
```

Ceci crée les fichiers CSV dans `data/synthetic/` :
- `prices_plastique.csv`, `prices_metal.csv`, `prices_verre.csv`, `prices_papier.csv`
- `volumes.csv`
- `transactions.csv`

### Entraînement des modèles

```bash
# Entraîner les modèles de prédiction et fraude
python scripts/retrain_models.py

# Entraîner le classificateur de déchets (nécessite un dataset d'images)
python models/waste_classifier/train.py --data-dir data/processed/waste_images
```

> ⚠️ **Note** : Le classificateur de déchets nécessite un dataset d'images (TrashNet ou similaire) organisé par catégorie dans `data/processed/waste_images/`.

### Lancement de l'API

```bash
uvicorn api.ai_server:app --host 0.0.0.0 --port 8000 --reload
```

Documentation Swagger : [http://localhost:8000/docs](http://localhost:8000/docs)

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Statut de l'API et des modèles |
| `POST` | `/api/classify` | Classifier un déchet (image) |
| `POST` | `/api/predict/price` | Prédiction de prix d'un matériau |
| `POST` | `/api/predict/volume` | Prédiction de volume par zone |
| `POST` | `/api/fraud/check` | Vérifier une transaction |

### Exemples

**Classification d'un déchet :**
```bash
curl -X POST http://localhost:8000/api/classify \
  -F "file=@photo_dechet.jpg"
```

Réponse :
```json
{
  "type": "plastique",
  "confidence": 0.94,
  "all_scores": {"plastique": 0.94, "metal": 0.02, ...},
  "tips": "Videz et rincez l'emballage..."
}
```

**Prédiction de prix :**
```bash
curl -X POST http://localhost:8000/api/predict/price \
  -H "Content-Type: application/json" \
  -d '{"material": "plastique", "periods": 7}'
```

Réponse :
```json
{
  "material": "plastique",
  "predictions": [
    {"date": "2025-07-15", "price": 0.32, "price_min": 0.28, "price_max": 0.36}
  ]
}
```

**Détection de fraude :**
```bash
curl -X POST http://localhost:8000/api/fraud/check \
  -H "Content-Type: application/json" \
  -d '{"poids": 50, "prix": 100, "heure": 14, "jour_semaine": 2}'
```

Réponse :
```json
{
  "risk_score": 12.5,
  "risk_level": "normal",
  "is_fraud": false,
  "reasons": [],
  "transaction_id": "N/A"
}
```

## 📁 Structure du projet

```
ecoloop_ai/
├── api/
│   ├── ai_server.py              # Serveur FastAPI principal
│   ├── routes/
│   │   ├── classify_routes.py    # Routes classification
│   │   ├── predict_routes.py     # Routes prédiction
│   │   └── fraud_routes.py       # Routes fraude
│   └── middleware/
│       └── auth.py               # Authentification JWT
├── models/
│   ├── waste_classifier/
│   │   ├── model.py              # MobileNetV2 CNN
│   │   ├── train.py              # Entraînement
│   │   └── preprocess.py         # Prétraitement images
│   ├── prediction/
│   │   ├── price_prediction.py   # Prophet (prix)
│   │   ├── volume_prediction.py  # XGBoost (volumes)
│   │   └── data_utils.py         # Utilitaires
│   └── fraud_detection/
│       ├── fraud_model.py        # Isolation Forest
│       └── feature_engineering.py # Features
├── data/                         # Datasets
├── saved_models/                 # Modèles entraînés
├── notebooks/                    # Exploration
├── tests/                        # Tests unitaires
├── scripts/                      # Scripts utilitaires
├── config/                       # Configuration
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Déploiement Docker

```bash
# Construire et lancer
docker-compose up -d --build

# Vérifier le statut
curl http://localhost:8000/api/health
```

## 🧪 Tests

```bash
pytest tests/ -v
```

## 📅 Maintenance

| Modèle | Fréquence de réentraînement |
|---|---|
| Prix (Prophet) | Hebdomadaire |
| Volumes (XGBoost) | Mensuel |
| Fraude (Isolation Forest) | Mensuel |
| Classification (MobileNetV2) | Quand de nouvelles données sont disponibles |

```bash
# Réentraîner tous les modèles
python scripts/retrain_models.py
```

## ✍️ Auteur

**Christ Music** — Responsable IA, Projet EcoLoop

## 📄 Licence

Ce projet est privé et confidentiel.
