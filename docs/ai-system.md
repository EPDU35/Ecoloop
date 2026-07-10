# Le Système IA d'EcoLoop

La vision d'EcoLoop s'articule autour du concept d'**Explainable AI (XAI)**.
Notre Moteur Décisionnel (Decision Support Engine) ne remplace pas l'humain, il augmente ses capacités en fournissant des prédictions transparentes et argumentées.

## L'Architecture Décisionnelle

Contrairement à une simple boîte noire, notre IA est construite comme un pipeline de modules :

### 1. Module Vision AI (Producteur)
L'acquisition de la donnée à la source est souvent le point faible des chaînes de logistique circulaire. Les producteurs (restaurants, ménages) ne connaissent pas toujours le type exact ou la pureté du matériau.
- **Fonctionnement** : Le producteur photographie son lot. Un modèle de vision par ordinateur présélectionne la catégorie (ex: PET, PEHD, Carton) et estime une volumétrie.
- **Bénéfice** : Réduction de la friction utilisateur et standardisation des "lots" entrants.

### 2. Matching Engine (Collecteur & Industriel)
- **Fonctionnement** : Le système pondère de multiples variables (distance géographique, type de véhicule du collecteur, historique de fiabilité, et besoin des industriels) pour affecter la mission au bon acteur.
- **Bénéfice** : Diminution de l'empreinte carbone logistique (moins de trajets à vide).

### 3. Prediction Engine (Mairie)
- **Fonctionnement** : Ce moteur ingère l'historique des collectes, les données démographiques des zones, et des données contextuelles externes (ex: météorologie, événements publics). Il génère un "Score de Risque de Saturation" par zone à J+7.
- **Explainable AI** : Plutôt que d'afficher uniquement "87% de risque", l'IA fournit le "Decision Log" (les facteurs ayant influencé le score : "*Baisse des collecteurs disponibles dans la zone + Augmentation prévue du volume*").
- **Bénéfice** : Les mairies passent d'une gestion *réactive* à une gestion *anticipative*.

## Évolutivité (Roadmap IA)
Aujourd'hui, l'architecture permet d'ingérer de la donnée qualifiée. Au fur et à mesure que l'adoption grandira, ces données (Feedback loop) serviront à réentraîner des modèles Machine Learning de plus en plus fins et ultra-localisés (spécifiques aux dynamiques d'une ville précise).
