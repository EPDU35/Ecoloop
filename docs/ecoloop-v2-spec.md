# ECOLOOP — DOCUMENT DE RÉFÉRENCE COMPLET
### Cahier des charges · Modèle économique · UX/UI · Architecture technique · Analyse critique
**Version 3.4 — Document de spécifications consolidé (Gel d'architecture V3.4)**

---

## Table des matières

1. [Vision & Executive Summary](#1-vision--executive-summary)
2. [Étude du problème](#2-étude-du-problème)
3. [Vision produit](#3-vision-produit)
4. [Personas](#4-personas)
5. [Cahier des charges fonctionnel](#5-cahier-des-charges-fonctionnel)
6. [Parcours utilisateur (UX)](#6-parcours-utilisateur-ux)
7. [Design System](#7-design-system)
8. [Architecture technique](#8-architecture-technique)
9. [Base de données & API](#9-base-de-données--api)
10. [Intelligence Artificielle](#10-intelligence-artificielle)
11. [Modèle économique](#11-modèle-économique)
12. [Sécurité & anti-fraude](#12-sécurité--anti-fraude)
13. [Analyse "avocat du diable" — failles et corrections](#13-analyse-avocat-du-diable--failles-et-corrections)
14. [Roadmap & Sprints](#14-roadmap--sprints)
15. [Business Plan & KPI](#15-business-plan--kpi)
16. [Annexes](#16-annexes)

---

## 1. Vision & Executive Summary

### 1.1 En une phrase
EcoLoop est une plateforme d'orchestration de la gestion des déchets qui connecte **ménages**, **entreprises de recyclage** et **mairies** autour d'un moteur d'intelligence artificielle, en transformant les déchets recyclables en EcoPoints (FCFA) et en réduisant les dépôts sauvages.

### 1.2 Le pivot stratégique
EcoLoop n'est **pas** une application de signalement de poubelles. C'est une **place de marché du déchet valorisable**, avec un module de salubrité urbaine qui vient en complément.

---

## 8. Architecture technique & Modèle Marketplace Pure

### 8.6 Architecture MVP - Clarification stratégique (V3.4)
EcoLoop opère selon un **Modèle A — Marketplace pure** :
- **Propriété** : EcoLoop ne devient **jamais** propriétaire du déchet. La transaction commerciale s'effectue directement entre le **Ménage** (vendeur) et le **Recycleur** (acheteur).
- **Rôle d'EcoLoop** : EcoLoop agit comme un facilitateur d'infrastructure en assurant la mise en relation, la logistique de collecte, la pesée contradictoire certifiée par preuve, l'idempotence des flux financiers et la traçabilité environnementale ESG.
- **Régulation et perception** : Les EcoPoints ne sont pas une monnaie privée mais une **récompense de valorisation écologique**. EcoLoop ne possède ni ne conserve l'argent des utilisateurs. Le recycleur paie pour la valeur du lot, EcoLoop prélève sa commission de fonctionnement et crédite le solde EcoPoints du ménage qui est ensuite converti en FCFA lors de virement mobile money opéré par un partenaire financier agréé.

---

## 9. Base de données & API

### 9.1 Nouvelles tables principales (schéma V3.4)

```
users            (id, phone, role, created_at, ...)                 -- trust_score global supprimé
households       (user_id, eco_points_balance_cache, address_geo, ...)
companies        (user_id, company_name, license_info, coverage_zone, ...)
municipalities   (id, name, region, contact_service_id, ...)

collectors       (id, user_id, type, -- COLLECTOR_INTERNAL | COLLECTOR_PARTNER
                  company_id NULLABLE,
                  vehicle_type, coverage_zone, trust_score, ...)

collector_profiles  (collector_id, verification_status, -- PENDING | VERIFIED | SUSPENDED
                     identity_verified, 
                     collector_reliability_score,       -- trust ciblé
                     earnings_history, reputation_score,
                     completed_missions, partner_since,
                     new_partner_boost,                 -- Boolean, surveillance/boost débutant
                     coverage_zone, vehicle_type)

company_profiles    (company_id, rating, completed_purchases, 
                     cancelled_purchases, average_payment_delay, 
                     buyer_reliability_score)           -- trust_score supprimé (V3.4)

household_profiles  (user_id, 
                     seller_reliability_score)          -- trust ciblé

lots             (id, household_id, category,
                  estimated_weight, actual_weight,
                  weight_verified_by, 
                  verification_method,                  -- MANUAL | BLUETOOTH_SCALE | PARTNER_CONFIRMATION | ADMIN_CHECK
                  status,                               -- CREATED | DISPONIBLE | OFFER_RECEIVED | ACCEPTED | EN_MISSION | COLLECTE | QUALITY_CHECK | PAYE | ANNULE (V3.4)
                  photo_url, geo_point,
                  quality_status,                       -- PENDING | VALIDATED | REJECTED | PARTIAL
                  quality_verified_by_id,               -- ID de l'entreprise ou admin vérificateur
                  quality_verified_at,                  -- Timestamp de vérification qualité
                  created_at, collected_at, ...)

verification_evidences (id, entity_type, entity_id, 
                        type,                           -- WEIGHT_PHOTO | QUALITY_PHOTO | GPS_PROOF | USER_CONFIRMATION
                        file_url, created_at)

purchase_offers  (id, lot_id, company_id, price_per_kg,
                  initial_price_per_kg,                 -- Historique des prix d'offres (V3.4)
                  final_price_per_kg,                   -- Historique des prix d'offres (V3.4)
                  modified_at,                          -- Historique des prix d'offres (V3.4)
                  status,                               -- PENDING | ACCEPTED | REJECTED | EXPIRED
                  idempotency_key UNIQUE,
                  created_at, expired_at,
                  accepted_at, accepted_by_user_id)     -- Règle multi-offres / traçabilité

reports          (id, reporter_id, geo_point, photo_url,
                  waste_type_breakdown, urgency_score,
                  status, municipality_id, created_at, resolved_at)

collection_missions  (id, collector_id, creator_id,      -- creator_id : Recycler ou Admin
                      assigned_collector_id,            -- Chauffeur ou partenaire physique affecté
                      hub_id NULLABLE, status, zone, capacity_kg,
                      center_lat, center_lng, radius_km,
                      assigned_at, accepted_at, started_at, completed_at,
                      idempotency_key UNIQUE,
                      created_at)

mission_lots     (mission_id, lot_id, sequence_order,
                  status,             -- ASSIGNED | COLLECTED | FAILED | MISSED | CANCELLED
                  arrival_status)     -- WAITING | ARRIVED | ABSENT | REFUSED | COLLECTED

collection_points    (id, name, location, capacity, manager_id, ...) -- points relais (cible V2)
collection_hubs      (id, name, zone, capacity_kg, responsible_user_id, ...)

pricing_sources  (id, material, price, source, provider, validated_at)
pricing_rules    (id, material, price_per_kg, effective_date,
                  created_by, active)

transactions     (id, lot_id, company_id, household_id,
                  pricing_rule_id,
                  material, price_per_kg_applied,      -- snapshot figé
                  weight_applied, amount_paid_by_company,
                  ecoloop_commission, household_reward, status,
                  guarantee_status,                    -- NOT_GUARANTEED | GUARANTEED | FAILED
                  guarantee_provider,                  -- ECOLOOP_ESCROW | DIRECT_PAYMENT | PARTNER_GUARANTEE
                  payment_provider, payment_reference, 
                  payment_status,                      -- PENDING | PROCESSING | SUCCESS | FAILED | REVERSED
                  idempotency_key UNIQUE,
                  paid_at)

disputes         (id, transaction_id, opened_by_id, reason, -- Enum strict: WEIGHT_DIFFERENCE | WRONG_MATERIAL | COLLECTION_FAILED | PAYMENT_DELAY
                  status, resolution_details, resolved_by_id, 
                  created_at, resolved_at)

enterprise_subscriptions  (id, company_id, plan, status, starts_at, renews_at)

eco_point_accounts (id, user_id, eco_points_balance_cache, created_at) -- Remplacant de wallets (V3.4)

eco_point_transactions  (id, account_id, type, amount, related_transaction_id,
                         status,                       -- PENDING | AVAILABLE | LOCKED | USED | CANCELLED | EXPIRED
                         created_at)                   -- Ledger immuable des EcoPoints

notifications    (id, user_id, type, message, 
                  priority,                            -- LOW | NORMAL | HIGH | URGENT
                  read_at, created_at)

audit_logs       (id, user_id, action, entity, 
                  old_value,                           -- JSONB, pour les objets structurés
                  new_value,                           -- JSONB, pour les objets structurés
                  created_at)

rating_events    (id, user_id, actor_id, event_type,   -- Explicabilité de confiance par rôle (V3.4)
                  impact_score, reason, related_entity, 
                  created_at)

system_configs   (key, value, description, updated_at)  -- Table de configuration globale (V3.4)

fraud_flags      (id, target_type, target_id, reason, status, reviewed_by)
```

### 9.2 Endpoints API clés (extraits, corrigés V3.4)

```
POST   /api/v2/lots                          Publier un lot
POST   /api/v2/lots/:id/offers               Soumettre une offre d'achat (Recycleur)
POST   /api/v2/lots/:id/offers/:offer_id/accept Accepter une offre (Ménage, idempotent)
POST   /api/v2/lots/:id/verify-weight         Enregistrer le poids réel + arrival_status (Idempotent)
POST   /api/v2/collection-missions            Créer une mission de collecte (Idempotent)
POST   /api/v2/transactions/:id/pay           Déclencher le paiement/répartition (Idempotent)
POST   /api/v2/ecopoints/:account_id/withdraw Retrait EcoPoints vers mobile money (Idempotent)
```

### 9.3 Règle multi-offres des Lots (`PurchaseOffer`)
Un lot recyclé publié par un ménage peut faire l'objet de plusieurs offres d'achat concurrentes soumises par différents recycleurs. Le ménage sélectionne l'offre la plus intéressante et l'accepte (`ACCEPTED`). Dès acceptation, toutes les autres offres associées à ce lot basculent automatiquement à l'état `REJECTED`, et l'attribution de la collecte est figée. Les attributs `accepted_at` et `accepted_by_user_id` de l'offre acceptée garantissent la traçabilité complète de l'accord commercial.

### 9.5 Le Portefeuille Ledger "EcoPoints" & Nomenclature technique (V3.4)
Le code technique abandonne complètement la nomenclature "wallet" pour adopter la structure de récompense **EcoPoints** :
- Fichier database : `eco_points.py`
- Table de comptes : `eco_point_accounts` (remplace `wallets`)
- Table de transactions : `eco_point_transactions`
- Cache de solde : `eco_point_accounts.eco_points_balance_cache`
Le solde de crédits est exprimé sous forme d'EcoPoints à parité (1 EcoPoint = 1 FCFA).
**Règle absolue** : La table `eco_point_transactions` (ledger immuable) est la seule source de vérité financière. Le cache de solde est mis à jour de façon synchrone lors de chaque nouvelle transaction par le service financier, et n'est jamais mis à jour de façon autonome.

### 9.13 Machine d'États des EcoPoints
Les EcoPoints transitent à travers un cycle strict pour garantir l'équité financière et la prévention des litiges :

```
                  VALIDATE (Recycleur)
  PENDING ──────────────────────────────────> AVAILABLE
     │                                            │
     │                                            │ DISPUTE (Ménage)
     │                                            ▼
     │ DISPUTE (Ménage/Recycleur)              LOCKED
     └────────────────────────────────────────────┬
                                                  │
                  ARBITRAGE (Admin EcoLoop)       │
                  ┌───────────────────────────────┤
                  ▼                               ▼
              AVAILABLE                       CANCELLED

                                                TIMEOUT
  AVAILABLE ────────────────────────────────> EXPIRED
```

1. **PENDING** : Créé automatiquement après pesée certifiée par le collecteur.
2. **AVAILABLE** : Devient retirable uniquement après validation de la qualité par le recycleur (`VALIDATE`).
3. **LOCKED** : Verrouillé temporairement si un litige est ouvert par l'une des parties.
4. **CANCELLED** : Annulé si le litige révèle que le lot était fictif ou non-conforme.
5. **EXPIRED** : Périmé automatiquement si le compte est inactif depuis plus de 12 mois.

---

## 10. Intelligence Artificielle

### 10.1 IA comme Assistant de tri et classification
L'IA est positionnée comme un **Assistant de classification et de tri** et non comme un automatisme. L'utilisateur prend une photo, l'IA suggère des catégories, et l'utilisateur confirme ou ajuste. Un formulaire manuel classique reste accessible à tout moment, servant de secours pour le MVP.

---

## 14. Roadmap & Sprints de Développement (V3.4)

### 14.1 Phase 0.5 : Test élargi de traction & KPIs (1-2 mois)
- **Objectif** : Valider l'attraction et l'intérêt économique à plus grande échelle.
- **Périmètre** : 100 ménages recrutés par des agents de quartier (`FIELD_AGENT`), 5 quartiers distincts, 5 collecteurs partenaires, 3 recycleurs, durée de 60 jours.
- **KPIs seuils acceptables** :
  - Taux d'activité des ménages à J+30 > 40%.
  - Taux de collecte réelle des lots publiés (au moins 150 lots collectés sur 200 publiés) > 70%.
  - Taux de réachat par les recycleurs (minimum 5 recycleurs actifs) > 50%.
  - Taux de participation des collecteurs actifs > 60%.
  - Coût d'acquisition d'un ménage < commission sur ses 3 premières collectes.

### 14.2 Sprint S1 — Backend Core (V3.4)
- Initialisation de la structure et migrations base de données :
  - Auth, utilisateurs, rôles (Ménages, Entreprises, Collecteurs, Admin Arbitre).
  - Profils de confiance par rôle (`household_profiles`, `collector_profiles`, `company_profiles`), suppression de `User.trust_score` et `company_profiles.trust_score`.
  - Schémas et modèles : `WasteLot` (avec quality audit), `verification_evidences` (preuves), `CollectionMission` (center, radius, timestamps logistiques, assigned_collector_id), `Transaction` (avec guarantee_status et guarantee_provider), `Dispute` (motifs stricts), `pricing_sources`, `purchase_offers` (avec initial/final price), `notifications` (avec priorités), `audit_logs` (avec JSONB), `rating_events` (explicabilité de confiance) et `system_configs`.
  - Ledger des EcoPoints immuable (`eco_point_transactions`).

### 14.3 Sprint S2 — Marketplace & Logistique MVP
- Publication de lot (saisie formulaire + Assistant IA).
- Soumission d'offres `PurchaseOffer` concurrentes et validation d'acceptation par le ménage.
- Création et acceptation de `CollectionMission` logistique.
- Clôture de mission et pesée contradictoire avec preuves (`verification_evidences`).
- Processus de validation qualité recycleur.

### 14.4 Sprint S3 — Flux Financier & Paiements Simulés
- Intégration de la machine d'état des EcoPoints.
- Paiement idempotent des transactions.
- Module de retraits simulés vers Mobile Money.

### 14.5 Sprint S4 — Intégrations avancées & IA (V2+)
- Connexion aux APIs réelles de Mobile Money locales.
- Dashboard mairie et analytics.
- Améliorations de l'Assistant IA avec collecte de datasets locaux.

---

*Fin du document.*
