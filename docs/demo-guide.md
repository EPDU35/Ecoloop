# Guide de Démo (VIBEATHON)

Ce document décrit le flux de présentation "Happy Path" à dérouler devant le jury. Les données sont persistantes mais peuvent être réinitialisées avec le script de Seed si besoin.

## 0. Initialisation (En cas de besoin)
Si la base de données est vide ou corrompue, exécuter depuis le dossier `ecoloop_backend/` :
```bash
python scripts/seed_demo.py
```
Cela créera les comptes démo et les lots par défaut.

## 1. Comptes Démo
Tous les comptes partagent le même mot de passe : **`Demo2026!`**

| Rôle | Email | Scénario |
| :--- | :--- | :--- |
| **Mairie** | `mairie@abobo.ci` | Dashboard Intelligence, Risque J+7 |
| **Producteur** | `producteur@restaurant.ci` | Scanner IA (Vision), création de lot |
| **Collecteur** | `collecteur@express.ci` | Optimisation des tournées de ramassage |
| **Industriel** | `industriel@plastique.ci` | Marketplace B2B, Achats de matières |

## 2. Scénario Recommandé (Ordre de Présentation)

1. **Connexion Mairie (`mairie@abobo.ci`)**
   - Montrer l'Intelligence Center.
   - Sélectionner la zone "Marché Central".
   - Montrer l'explicabilité IA (Pourquoi le risque est élevé ?).
   - Cliquer sur "Simuler dans 7 jours" pour montrer le passage du mode réactif au prédictif.
2. **Connexion Producteur (`producteur@restaurant.ci`)**
   - Accéder au "Scanner IA".
   - Charger une image de plastique (bouteilles).
   - Montrer la reconnaissance automatique de la matière et de la valeur estimée (Explainable Vision).
   - Valider la publication du lot.
3. **Connexion Industriel (`industriel@plastique.ci`)**
   - Accéder à la Marketplace (ou Dashboard).
   - Montrer que le lot publié à l'étape 2 est immédiatement disponible et qualifié pour l'achat.
   - Appuyer sur l'aspect reporting RSE/ESG généré par l'IA.

*Note: En cas de problème de connexion internet le jour J, n'oubliez pas d'avoir un serveur local (frontend/backend) en tâche de fond.*
