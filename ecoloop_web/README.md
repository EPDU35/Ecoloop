# EcoLoop - Frontend Web

Application web de la plateforme EcoLoop, construite avec React 18, TypeScript et Vite.

## Stack

- **React 18** avec TypeScript
- **Vite 5** pour le bundling et le dev serveur
- **React Router v6** pour le routage
- **Axios** pour les appels API avec interceptor JWT
- **Lucide React** pour les icônes

## Fonctionnalités

- Authentification (login, register, OTP)
- Gestion des profils utilisateur (Producteur, Collecteur, Industriel, Mairie)
- Tableau de bord et analytics
- Gestion des lots de déchets
- Système de collecte et validation
- Paiements et récompenses
- Notifications en temps réel

## Démarrage

```bash
npm install
npm run dev          # Dev sur http://localhost:5173
npm run build        # Production dans dist/
npm run preview      # Prévisualisation du build
```

## Configuration

Les variables d'environnement sont dans `src/config/index.ts` :

```ts
API_BASE_URL = '/api/v1'   # Proxy vers le backend
```

En développement, Vite proxy `/api` vers `http://localhost:8000` (voir `vite.config.ts`).

## Structure

```
src/
├── auth/          # Connexion, inscription, layout
├── config/        # Configuration API
├── hooks/         # Hooks React réutilisables
├── models/        # Types TypeScript
├── services/      # Client API Axios avec JWT
├── assets/        # Images et icônes
├── App.tsx        # Composant racine
└── main.tsx       # Point d'entrée
```

## Docker

```bash
docker build -t ecoloop-web .
docker run -p 3000:3000 ecoloop-web
```
