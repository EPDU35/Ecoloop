# EcoLoop AI

![EcoLoop Hero Banner](https://via.placeholder.com/1200x400/0D1F16/3FA34D?text=EcoLoop+AI)

> L'Intelligence Artificielle au service de l'Économie Circulaire. 

## 🌍 Vision
Transformer les déchets urbains en ressources prédictibles pour les villes africaines de demain. EcoLoop n'est pas une simple application de collecte, c'est un **Decision Support Engine** (Moteur d'Aide à la Décision) conçu pour anticiper, connecter et valoriser.

---

## 🚨 Le Problème
Aujourd'hui, les déchets représentent un problème environnemental majeur, mais également une ressource économique massivement sous-exploitée :
- **Le Producteur** (restaurateur, supermarché) ne connaît pas la valeur de ses déchets.
- **Le Collecteur** manque d'informations pour optimiser ses tournées et rentabiliser ses déplacements.
- **L'Industriel** manque de matières premières fiables et traçables pour le recyclage.
- **La Mairie** (Collectivité) manque de visibilité globale et intervient trop tard (gestion réactive).

---

## 💡 La Solution
EcoLoop connecte 4 acteurs majeurs via une plateforme unique et intelligente :
1. **Producteur** : Utilise le Scanner IA pour identifier, peser et publier ses lots de déchets.
2. **Collecteur** : Reçoit des missions optimisées et est rémunéré équitablement.
3. **Industriel** : Achète des matières certifiées sur une marketplace B2B avec traçabilité ESG.
4. **Mairie** : Pilote sa ville avec un tableau de bord prédictif (Risques de saturation, aide à la décision).

---

## 🧠 Intelligence Artificielle (AI Engine)
EcoLoop s'appuie sur trois modules d'IA (approche *Explainable AI*) :
- **Prediction Engine** : Anticipe les volumes de déchets et identifie les zones à risque de saturation à J+7 en fonction des données historiques et météorologiques.
- **Vision AI** : Aide à qualifier automatiquement la matière (PET, Carton, Métal) via la reconnaissance d'image pour le producteur.
- **Matching Engine** : Optimise la mise en relation entre les lots disponibles, la capacité des collecteurs et la demande industrielle.

---

## 🏗️ Architecture

```mermaid
graph TD
    User((Utilisateur)) --> Frontend
    
    subgraph "Présentation (Vercel)"
    Frontend[React + Vite Web App]
    end
    
    subgraph "Logique & API (Render)"
    Frontend --> API[FastAPI Backend]
    API <--> Cache[(Redis)]
    API <--> DB[(PostgreSQL)]
    end
    
    subgraph "Moteur Décisionnel"
    API <--> AI[EcoLoop AI Service]
    AI --> Models[Vision / Predictor]
    end
```

---

## 🛠️ Stack Technique

### Backend (API Centrale)
- **Framework** : FastAPI (Python 3.12)
- **Base de données** : PostgreSQL + SQLAlchemy (Async) + Alembic
- **Cache & Asynchronisme** : Redis, FastAPI Cache
- **Sécurité** : JWT, Rate Limiting (SlowAPI)

### Frontend (Client Web)
- **Framework** : React 18
- **Build Tool** : Vite
- **Langage** : TypeScript
- **Styling** : CSS natif (Design System "EcoLoop")

---

## 🚀 Installation & Développement local

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (optionnel, fallback en mémoire inclus)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-org/ecoloop.git
cd ecoloop
```

### 2. Démarrer le Backend
```bash
cd ecoloop_backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env

# Lancer le serveur de développement
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Démarrer le Frontend
```bash
cd ecoloop_web
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

---

## ☁️ Déploiement

- **Frontend** : Configuré pour un déploiement continu sur **Vercel** (`vercel.json` inclus).
- **Backend** : Configuré pour un déploiement sur **Render** ou AWS via `Dockerfile` (Healthcheck `/health` inclus).
- **CI/CD** : Intégrations prêtes pour GitHub Actions.

---
*EcoLoop a été conçu dans le cadre du VIBEATHON 2026.*
