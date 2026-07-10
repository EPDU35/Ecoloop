# Documentation API (EcoLoop)

Bienvenue dans la documentation de l'API EcoLoop.
Notre backend est construit avec **FastAPI**, qui génère automatiquement une documentation interactive exhaustive (Swagger UI et ReDoc).

## Accéder à la documentation interactive

Une fois le serveur backend lancé (par défaut sur `http://localhost:8000`), vous pouvez consulter la documentation en direct :

- **Swagger UI** (Recommandé pour tester) : [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc** (Recommandé pour la lecture de schémas complexes) : [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Principaux Domaines de l'API

L'API est structurée autour des domaines métier suivants :

1. **Authentication** (`/api/v1/auth`) : Login, Enregistrement, Refresh de tokens.
2. **Users** (`/api/v1/users`) : Gestion des profils par rôle.
3. **Wastes / Lots** (`/api/v1/wastes`) : Déclaration des déchets, scan IA.
4. **Collections** (`/api/v1/collections`) : Missions des collecteurs.
5. **Dashboard & AI** (`/api/v1/dashboard`, `/api/v1/ai`) : Insights, prédictions et simulations de risque.

Toutes les routes (sauf `/auth/login` et `/health`) nécessitent un token Bearer valide pour des raisons de sécurité.
