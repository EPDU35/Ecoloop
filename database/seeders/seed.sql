-- EcoLoop Seed Data Script (PostgreSQL)
-- Provides mock data for local development and demonstration.
-- Default password for all seed accounts: Password123!
-- (Bcrypt hash: $2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe)

-- ---------------------------------------------------------------------------
-- 1. Insert Users
-- ---------------------------------------------------------------------------
INSERT INTO users (
    id, full_name, email, phone, hashed_password, role, is_active, is_verified, failed_login_attempts, created_at, updated_at
) VALUES 
-- Admin
('10000000-0000-0000-0000-000000000001', 'EcoLoop Admin', 'admin@ecoloop.ci', '+22501020304', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'ADMIN', TRUE, TRUE, 0, NOW(), NOW()),
-- Producers
('20000000-0000-0000-0000-000000000001', 'Koffi Kouassi (Producteur)', 'koffi@ecoloop.ci', '+22505060708', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'PRODUCTEUR', TRUE, TRUE, 0, NOW(), NOW()),
('20000000-0000-0000-0000-000000000002', 'Awa Diallo (Producteur)', 'awa@ecoloop.ci', '+22509090909', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'PRODUCTEUR', TRUE, TRUE, 0, NOW(), NOW()),
-- Collectors
('30000000-0000-0000-0000-000000000001', 'Moussa Traore (Collecteur)', 'moussa@ecoloop.ci', '+22507070707', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'COLLECTEUR', TRUE, TRUE, 0, NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'Bakary Kone (Collecteur)', 'bakary@ecoloop.ci', '+22508080808', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'COLLECTEUR', TRUE, TRUE, 0, NOW(), NOW()),
-- Industrial
('40000000-0000-0000-0000-000000000001', 'SOCIETE PLASTIQUE CI', 'plastique_ci@ecoloop.ci', '+22511223344', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'INDUSTRIEL', TRUE, TRUE, 0, NOW(), NOW()),
-- Municipality
('50000000-0000-0000-0000-000000000001', 'Mairie de Cocody', 'cocody@ecoloop.ci', '+22555667788', '$2b$12$Eef.gS4JjI/o.B5p.xY4/ex0e3zX9CenxI2p/a7.9t9Yq4q7Z.SGe', 'MAIRIE', TRUE, TRUE, 0, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 2. Insert Rewards (Required for all producers / users)
-- ---------------------------------------------------------------------------
INSERT INTO rewards (id, user_id, total_kg_recycled, points, level, updated_at) VALUES
('b0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 120.0, 1200, 'bronze', NOW()),
('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 350.0, 3500, 'argent', NOW());

-- ---------------------------------------------------------------------------
-- 3. Insert Collector Profiles & Locations
-- ---------------------------------------------------------------------------
INSERT INTO collector_profiles (
    id, status, status_updated_at, verification_status, vehicle_capacity_kg, vehicle_type, service_radius_km, average_rating, completed_collections_count, total_collections_count
) VALUES
('30000000-0000-0000-0000-000000000001', 'AVAILABLE', NOW(), 'VERIFIED', 800.0, 'Tricycle motorise', 10.0, 4.8, 12, 12),
('30000000-0000-0000-0000-000000000002', 'AVAILABLE', NOW(), 'VERIFIED', 3000.0, 'Camion benne', 20.0, 4.5, 34, 36);

-- Set positions (Cocody area)
INSERT INTO collector_locations (collector_id, latitude, longitude, accuracy_meters, updated_at) VALUES
('30000000-0000-0000-0000-000000000001', 5.348400, -3.980600, 10.0, NOW()),
('30000000-0000-0000-0000-000000000002', 5.352100, -3.978200, 5.0, NOW());

-- ---------------------------------------------------------------------------
-- 4. Insert Waste Lots (Available)
-- ---------------------------------------------------------------------------
INSERT INTO waste_lots (
    id, producer_id, collector_id, category, description, weight_kg, price_per_kg, photo_url, latitude, longitude, status, created_at, updated_at
) VALUES
-- Lot 1: Plastique
('f0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NULL, 'PLASTIQUE', 'Bouteilles PET triees et lavees', 150.00, 150.00, NULL, 5.348000, -3.980000, 'DISPONIBLE', NOW(), NOW()),
-- Lot 2: Carton
('f0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', NULL, 'CARTON', 'Boites en carton plat compactees', 420.00, 80.00, NULL, 5.345000, -3.982000, 'DISPONIBLE', NOW(), NOW());
