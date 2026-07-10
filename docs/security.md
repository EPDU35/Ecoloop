# Sécurité

La sécurité n'est pas une réflexion après coup dans EcoLoop, elle est "Security by Design". Manipulant des transactions financières et des données géographiques d'acteurs publics et privés, le système intègre des couches de protection multiples.

## Authentification & Autorisation
- **JWT (JSON Web Tokens)** : Les sessions sont gérées de manière stateless via des tokens JWT signés. Les tokens ont une durée de vie courte (15 minutes) couplés à un mécanisme de "Refresh Token" stocké de manière sécurisée.
- **RBAC (Role-Based Access Control)** : Le système utilise des rôles stricts (PRODUCTEUR, COLLECTEUR, INDUSTRIEL, MAIRIE, ADMIN). Les "Middlewares" et dépendances FastAPI (`require_roles`) bloquent l'accès aux routes non autorisées avant même l'exécution de la logique métier.

## Protection de l'API
- **CORS Stricte** : La configuration CORS n'autorise que les domaines spécifiques (Vercel, Render, localhost) en production.
- **Rate Limiting (SlowAPI)** : Protège contre les attaques DDoS et de Force Brute. Les endpoints sensibles (comme `/login`) ont des limites strictes (ex: 5 requêtes par minute).
- **Security Headers** : Utilisation d'un middleware dédié pour injecter des en-têtes comme `X-Frame-Options`, `Content-Security-Policy` et `Strict-Transport-Security` (HSTS).

## Protection des Données (Base de Données)
- **Mots de passe hachés** : Les mots de passe ne sont jamais stockés en clair (utilisation de `bcrypt` avec sel).
- **Injections SQL** : SQLAlchemy / Pydantic préviennent nativement les injections SQL en échappant automatiquement les paramètres des requêtes et en validant les types.

## Gestion des Secrets
- Aucun secret n'est commité dans Git (présence d'un `.env.example`).
- Les tokens API tiers (Cloudinary, Firebase, OpenAI) sont injectés dynamiquement via les variables d'environnement au démarrage des conteneurs.
