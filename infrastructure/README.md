# Infrastructure EcoLoop

Ce dossier orchestre l'ensemble de la plateforme EcoLoop avec Docker Compose :
base de données, cache, API, frontend, service IA, reverse proxy et monitoring.

## Architecture

```
                 ┌─────────────┐
   Client ──────▶│   nginx     │  (reverse proxy, TLS, sécurité)
                 │  :80 / :443 │
                 └──────┬──────┘
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
      ┌────────┐   ┌──────────┐   ┌────────┐
      │  web   │   │ backend  │   │   ai   │
      │ :3000  │   │  :8000   │   │ :8001  │
      └────────┘   └────┬─────┘   └────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
        ┌───────┐  ┌────────┐  ┌─────────┐
        │  db   │  │ redis  │  │prometheus│
        │:5432  │  │ :6379  │  │ :9090   │
        └───────┘  └────────┘  └────┬────┘
                                    ▼
                                ┌─────────┐
                                │ grafana │
                                │ :3001   │
                                └─────────┘
```

## Contenu

| Chemin | Rôle |
|--------|------|
| `docker-compose.yml` | Orchestrateur global de tous les services |
| `nginx/nginx.conf` | Reverse proxy, TLS, en-têtes de sécurité |
| `nginx/conf.d/` | Extensions de configuration nginx |
| `nginx/certs/` | Certificats TLS (à déposer en production) |
| `monitoring/prometheus.yml` | Cible de scrape Prometheus |
| `monitoring/grafana-dashboard.json` | Dashboard Grafana d'exemple |
| `docker/ai.Dockerfile` | Image du service IA |
| `docker/web.dev.Dockerfile` | Image dev du frontend (Vite hot reload) |
| `docker/docker-compose.override.yml` | Override de développement |

## Prérequis

- Docker + Docker Compose v2
- Fichier `ecoloop_backend/.env` présent (voir `ecoloop_backend/.env.example`)

## Lancement

### Production / pré-production
```bash
docker compose -f infrastructure/docker-compose.yml --env-file ecoloop_backend/.env up --build -d
```

### Avec monitoring
```bash
docker compose -f infrastructure/docker-compose.yml --profile monitoring up -d
```

### Avec le service IA
```bash
docker compose -f infrastructure/docker-compose.yml --profile ai up -d
```

### Développement (hot reload)
```bash
docker compose -f infrastructure/docker-compose.yml -f infrastructure/docker/docker-compose.override.yml up
```

## Accès aux services

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API | http://localhost/api/v1 |
| Health API | http://localhost/api/v1/health (ou http://localhost/healthz pour nginx) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / admin) |

## Notes

- Le service mobile (`ecoloop_mobile`, Flutter) n'est pas conteneurisé ici :
  il se lance via `flutter run` et dialogue avec le backend via le réseau
  hôte (`10.0.2.2` sous l'émulateur Android, voir `.env`).
- Les certificats TLS (`infrastructure/nginx/certs/`) doivent être générés
  via certbot en production ; nginx redirige le trafic 80 → 443.
- Le service IA démarre uniquement avec le profil `ai` car `ai_server.py`
  est encore vide (à implémenter).
