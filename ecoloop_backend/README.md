# EcoLoop Backend — API FastAPI

Backend de la plateforme EcoLoop : gestion des utilisateurs, des lots de déchets,
des collectes, des transactions et des paiements. Conforme à l'architecture
définie dans le dossier technique EcoLoop AI (`ecoloop_backend/`).

## Stack

- **FastAPI** (async) + **Uvicorn/Gunicorn**
- **PostgreSQL** via SQLAlchemy 2.0 (async) + **Alembic** pour les migrations
- **JWT** (access court + refresh long, rotation à chaque refresh)
- **Cloudinary** pour le stockage des photos de déchets
- **Redis** (cache / rate limiting) — optionnel selon l'environnement
- **slowapi** pour le rate limiting par IP

## Démarrage rapide

### Option A — Docker Compose (recommandé, 1 commande)

```bash
cp .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(64))"   # -> coller dans SECRET_KEY
docker compose up --build
```

Ça lance PostgreSQL + applique automatiquement la migration + démarre l'API sur
`http://localhost:8000`. La migration initiale (`migrations/versions/d352e6418378_init_schema.py`)
est déjà générée et testée dans cette livraison — elle crée les 6 tables
(`users`, `waste_lots`, `collections`, `transactions`, `rewards`, `alembic_version`)
avec toutes les clés étrangères.

### Option B — environnement local manuel

```bash
cp .env.example .env
# Éditer .env : générer SECRET_KEY, renseigner DATABASE_URL, Cloudinary, etc.
python -c "import secrets; print(secrets.token_urlsafe(64))"   # -> SECRET_KEY

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

alembic upgrade head        # applique les migrations
uvicorn main:app --reload   # démarre l'API sur http://localhost:8000
```

Avec Docker :

```bash
docker build -t ecoloop-backend .
docker run --env-file .env -p 8000:8000 ecoloop-backend
```

Documentation interactive : `/docs` (désactivée automatiquement si `ENVIRONMENT=production`).

## Structure

```
ecoloop_backend/
├── main.py                  ← Point d'entrée, middlewares, gestion d'erreurs
├── app/
│   ├── config/               ← settings, database, security (JWT, hash, OTP)
│   ├── api/routes/            ← endpoints HTTP (validation d'entrée + délégation)
│   ├── controllers/          ← logique métier (aucune logique dans les routes)
│   ├── models/                ← ORM SQLAlchemy
│   ├── schemas/                ← Pydantic (validation stricte des entrées/sorties)
│   ├── services/                ← matching, paiement, notifications, routing
│   ├── middlewares/              ← JWT (authentification) + RBAC (autorisation)
│   └── utils/                     ← rate limiter, helpers transverses
└── migrations/                     ← Alembic
```

## Audit de sécurité — ce qui est déjà en place

| Domaine | Mesure |
|---|---|
| Mots de passe | bcrypt (12 rounds), politique de complexité obligatoire côté schéma |
| Authentification | JWT access (15 min) + refresh (7 jours) avec rotation à chaque refresh |
| Brute-force | Verrouillage de compte après N échecs (`MAX_LOGIN_ATTEMPTS`), rate limiting IP sur `/auth/*` |
| Énumération de comptes | Messages d'erreur génériques identiques (login, register, password-reset) |
| Autorisation | RBAC strict par rôle (`require_roles`) + vérification de propriété (IDOR) sur chaque ressource |
| Injection SQL | 100% ORM SQLAlchemy paramétré, aucune concaténation de requêtes |
| IDOR | UUID non séquentiels comme clés primaires, vérification `producer_id`/`collector_id` avant toute action |
| Concurrence | `SELECT ... FOR UPDATE` sur la réservation de lot et la validation de collecte (anti double-réservation) |
| Paiements | Montants toujours recalculés côté serveur, jamais acceptés depuis le client ; webhook signé HMAC-SHA256, idempotent |
| Upload fichiers | Type MIME et taille validés avant envoi à Cloudinary |
| Transport | CORS strict (liste blanche), `TrustedHostMiddleware`, HSTS en production |
| En-têtes HTTP | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| Fuite d'information | Gestionnaire d'erreurs global : jamais de stack trace ni de détail interne renvoyé au client |
| Secrets | Aucun défaut exploitable ; `SECRET_KEY` invalide = l'application refuse de démarrer |
| Documentation API | `/docs`, `/redoc`, `/openapi.json` désactivés automatiquement en production |
| Conteneur | Utilisateur non-root dans le Dockerfile, image slim |

## Ce qui a été réellement testé (pas juste écrit)

- Migration Alembic générée et **appliquée** sur une vraie instance PostgreSQL 16 : les 6 tables et toutes les clés étrangères sont créées sans erreur.
- Scénario bout-en-bout exécuté avec succès contre cette base : `POST /auth/register` → `POST /auth/login` → `GET /users/me` (JWT vérifié) → `POST /wastes` (lot créé avec `producer_id` correct).
- **Bug corrigé pendant ce test** : `passlib 1.7.4` est incompatible avec `bcrypt >= 4.1` (erreur `password cannot be longer than 72 bytes` au premier hash, même sur un mot de passe court — bug connu de la lib, pas du code). `requirements.txt` épingle donc `bcrypt==4.0.1`. Sans ce correctif, **l'inscription plantait systématiquement**.

## Ce qui reste à faire avant la production (audit honnête, façon "avocat du diable")

- **Redis n'est pas encore branché** au rate limiter (actuellement en mémoire process) ni à une liste de révocation de tokens (logout ne blackliste pas encore l'access token en cours — il reste valide jusqu'à expiration, max 15 min).
- **`matching_service.find_nearby_collectors`** est un squelette : il ne lit pas encore de position GPS réelle (table `gps_positions` non présente dans le périmètre fourni). À brancher avec PostGIS pour un vrai calcul de proximité en base.
- **Webhook de paiement** : la vérification de signature est fonctionnelle, mais aucun connecteur réel (Orange Money, MTN MoMo, Wave...) n'est implémenté — seul le contrat d'interface l'est.
- **OTP** : généré et hashé correctement en base, mais aucun envoi SMS/email réel n'est branché (le code repart actuellement uniquement via un `TODO` dans `auth.py` — à connecter à un fournisseur SMS pour la Côte d'Ivoire).
- **Logs d'audit** : pas de table `audit_log` dédiée pour tracer qui a fait quoi (utile pour un litige producteur/collecteur).
- **Tests automatisés** : absents de cette livraison — à ajouter avant tout déploiement (pytest + httpx.AsyncClient), en particulier sur les scénarios de concurrence (double réservation) et de RBAC.
- **CI/CD** : pas de pipeline GitHub Actions fourni ici (mentionné dans le dossier technique mais hors périmètre backend pur).

## Convention interne

Toute nouvelle route doit : valider l'entrée via un schéma Pydantic dédié,
déléguer la logique à un controller, jamais interroger la base directement
dans `app/api/routes/`, et jamais faire confiance à un identifiant ou un
montant envoyé par le client sans le revérifier côté serveur.
