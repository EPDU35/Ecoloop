# EcoLoop - Frontend Web (Vite + React + TS)

Ce projet est configuré pour se connecter de manière fluide et sécurisée au backend FastAPI.

## ⚙️ Intégration API & Sécurité

Pour simplifier le développement, les outils de connexion fondamentaux sont déjà codés :
1. **Client API configuré** (`src/services/api.ts`) :
   * Contient l'instance d'Axios pointant sur le bon préfixe d'API.
   * Ajoute automatiquement les en-têtes d'autorisation JWT `Authorization: Bearer <token>`.
   * Gère automatiquement le renouvellement de session (rotation de Refresh Token) si le token d'accès expire en cours de route.
2. **Context de Session** (`src/auth/AuthContext.tsx`) :
   * Fournit l'état de l'utilisateur connecté (`user`, `loading`).
   * Expose les méthodes `login`, `register`, `verifyOtp`, et `logout`.
3. **Proxy de Développement** (`vite.config.ts`) :
   * Redirige automatiquement le trafic de dev `/api` vers `http://localhost:8000`. Pas de configuration de CORS complexe nécessaire sur le poste de dev.

## 🚀 Lancement local

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Démarrez le serveur de développement local :
   ```bash
   npm run dev
   ```

3. Créez vos pages et composants directement dans `src/`. Vous pouvez utiliser la classe CSS standard ou importer des bibliothèques externes selon vos préférences.
