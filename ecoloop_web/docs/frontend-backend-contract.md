# Contrat d'Interface Frontend-Backend EcoLoop

Ce document recense les endpoints de l'API FastAPI (`ecoloop_backend`) réellement disponibles et utilisés par le frontend React (`ecoloop_web`).

## Backend sélectionné
- **URL validée** : `https://ecoloop-backend-s1vd.onrender.com/api/v1`
- **Raison** : Parmi les 3 URLs fournies, c'est celle qui a correctement répondu aux routes `/health` et `/api/v1/auth/login`.

## Authentification & Utilisateurs (`/auth` & `/users`)

| Endpoint | Méthode | Rôle Autorisé | Payload Attendu | Réponse Attendue | Utilisation Frontend |
|----------|---------|---------------|-----------------|------------------|----------------------|
| `/auth/login` | POST | Tous | `{"email", "password"}` | `{"access_token", "refresh_token", "token_type"}` | Page de connexion (`/login`) |
| `/auth/refresh` | POST | Tous | `{"refresh_token"}` | `{"access_token", "refresh_token", "token_type"}` | Client API (intercepteur) |
| `/users/me` | GET | Authentifié | Aucun | `{"id", "full_name", "email", "role", "is_active"...}` | Récupération du profil global |
| `/users/gps` | POST | Authentifié | `{"latitude", "longitude", "accuracy_meters"}` | `{"latitude", "longitude", ...}` | Mise à jour de la localisation (Producteur/Collecteur) |

## Gestion des Déchets (`/wastes`)

| Endpoint | Méthode | Rôle Autorisé | Payload Attendu | Réponse Attendue | Utilisation Frontend |
|----------|---------|---------------|-----------------|------------------|----------------------|
| `/wastes` | POST | Producteur | `{"category", "weight_kg", "price_per_kg", "latitude", "longitude"}` | Lot créé (`WasteLotOutSchema`) | Dashboard Producteur (Nouveau lot) |
| `/wastes/{lot_id}/photo` | POST | Producteur | `UploadFile (image)` | Lot mis à jour avec `photo_url` | Dashboard Producteur (Upload photo) |
| `/my-wastes` | GET | Producteur | `?limit=50&offset=0` | Liste de `WasteLotOutSchema` | Dashboard Producteur (Lots actifs) |
| `/history` | GET | Producteur | Aucun | Liste de `WasteLotOutSchema` | Dashboard Producteur (Historique complet) |
| `/available-wastes` | GET | Collecteur | `?category=...` | Liste de `WasteLotOutSchema` | Dashboard Collecteur (Lots à ramasser) |
| `/price-suggestion` | GET | Authentifié | `?category=...` | `{"suggested_price_per_kg", "source"}` | Dashboard Producteur (Suggestion IA prix) |

## Collectes (`/reserve` & `/validate-collection`)

| Endpoint | Méthode | Rôle Autorisé | Payload Attendu | Réponse Attendue | Utilisation Frontend |
|----------|---------|---------------|-----------------|------------------|----------------------|
| `/reserve` | POST | Collecteur | `{"waste_lot_id"}` | `CollectionOutSchema` | Dashboard Collecteur (Réserver lot) |
| `/validate-collection/{id}`| POST | Collecteur | `{"validation_code", "actual_weight_kg"}`| `CollectionOutSchema` | Dashboard Collecteur (Valider mission) |

## IA & Impact (`/ai`)

| Endpoint | Méthode | Rôle Autorisé | Payload Attendu | Réponse Attendue | Utilisation Frontend |
|----------|---------|---------------|-----------------|------------------|----------------------|
| `/ai/zones-risk` | POST | Authentifié | `{"zone", "population", ...}` | `{"status", "data": prediction}` | Dashboard Mairie (Carte risques) |
| `/ai/match-collector` | POST | Authentifié | `{"lot_lat", "lot_lon", "lot_weight_kg", "collectors": [...]}` | `{"status", "data": {"matches": [...]}}` | Moteur de décision (Backend ou simulé) |
| `/ai/impact` | POST | Authentifié | `{"total_recycled_kg", "participation_months", "collections_count"}` | `{"status", "data": {"ecoscore", "impact"}}` | Dashboards Producteur & Mairie |

---
*Note: Le module Industriel (`/industrial`) ne semblant pas exposer de marketplace dédié aux déchets bruts (qui sont des `wastes`), l'industriel devra interagir avec le Dashboard via un endpoint spécifique aux achats ou utiliser `/available-wastes` s'il reçoit les permissions nécessaires.*
