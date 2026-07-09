-- EcoLoop Database Schema (PostgreSQL)
-- Auto-generated from SQLAlchemy / Alembic migration models

-- ---------------------------------------------------------------------------
-- 1. Custom Types (Enums)
-- ---------------------------------------------------------------------------

CREATE TYPE userrole AS ENUM (
    'PRODUCTEUR', 
    'COLLECTEUR', 
    'INDUSTRIEL', 
    'MAIRIE', 
    'ADMIN'
);

CREATE TYPE wastecategory AS ENUM (
    'PLASTIQUE', 
    'CARTON', 
    'METAL', 
    'VERRE', 
    'ORGANIQUE', 
    'ELECTRONIQUE', 
    'AUTRE'
);

CREATE TYPE lotstatus AS ENUM (
    'DISPONIBLE', 
    'RESERVE', 
    'COLLECTE', 
    'ANNULE'
);

CREATE TYPE collectionstatus AS ENUM (
    'RESERVEE', 
    'EN_ROUTE', 
    'VALIDEE', 
    'ANNULEE'
);

CREATE TYPE paymentmethod AS ENUM (
    'MOBILE_MONEY', 
    'ESPECES', 
    'VIREMENT'
);

CREATE TYPE transactionstatus AS ENUM (
    'EN_ATTENTE', 
    'PAYEE', 
    'ECHOUEE', 
    'REMBOURSEE'
);

CREATE TYPE collectorstatus AS ENUM (
    'AVAILABLE', 
    'BUSY', 
    'OFFLINE', 
    'SUSPENDED'
);

CREATE TYPE verificationstatus AS ENUM (
    'PENDING', 
    'VERIFIED', 
    'REJECTED'
);

CREATE TYPE rewardaction AS ENUM (
    'COLLECTION_COMPLETED', 
    'SIGNUP_BONUS', 
    'REFERRAL', 
    'PENALTY', 
    'ADMIN_ADJUSTMENT'
);

CREATE TYPE notificationtype AS ENUM (
    'COLLECTION_REQUEST', 
    'COLLECTION_ACCEPTED', 
    'PAYMENT_RECEIVED', 
    'REWARD_GAINED', 
    'SYSTEM'
);

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- --- Users ---
CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role userrole NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL,
    otp_hash VARCHAR(255) NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NULL,
    reset_token_hash VARCHAR(255) NULL,
    reset_token_expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_users_email ON users(email);
CREATE UNIQUE INDEX ix_users_phone ON users(phone);

-- --- Rewards ---
CREATE TABLE rewards (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    total_kg_recycled DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    points INTEGER NOT NULL DEFAULT 0,
    level VARCHAR(30) NOT NULL DEFAULT 'bronze',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rewards_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_rewards_user_id ON rewards(user_id);

-- --- Collector Profiles ---
CREATE TABLE collector_profiles (
    id UUID PRIMARY KEY,
    status collectorstatus NOT NULL DEFAULT 'AVAILABLE',
    status_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verification_status verificationstatus NOT NULL DEFAULT 'PENDING',
    vehicle_capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    vehicle_type VARCHAR(50) NULL,
    service_radius_km DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    average_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    completed_collections_count INTEGER NOT NULL DEFAULT 0,
    total_collections_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_collector_profiles_id FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_collector_profiles_id ON collector_profiles(id);

-- --- Collector Locations ---
CREATE TABLE collector_locations (
    collector_id UUID PRIMARY KEY,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    accuracy_meters DOUBLE PRECISION NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_collector_locations_collector_id FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_collector_locations_collector_id ON collector_locations(collector_id);
CREATE INDEX ix_collector_locations_updated_at ON collector_locations(updated_at);

-- --- Waste Lots ---
CREATE TABLE waste_lots (
    id UUID PRIMARY KEY,
    producer_id UUID NOT NULL,
    collector_id UUID NULL,
    category wastecategory NOT NULL,
    description TEXT NULL,
    weight_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    photo_url VARCHAR(500) NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    status lotstatus NOT NULL DEFAULT 'DISPONIBLE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_waste_lots_producer_id FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_waste_lots_collector_id FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_waste_lots_producer_id ON waste_lots(producer_id);
CREATE INDEX ix_waste_lots_collector_id ON waste_lots(collector_id);
CREATE INDEX ix_waste_lots_status ON waste_lots(status);

-- --- Collections ---
CREATE TABLE collections (
    id UUID PRIMARY KEY,
    waste_lot_id UUID NOT NULL,
    collector_id UUID NOT NULL,
    status collectionstatus NOT NULL DEFAULT 'RESERVEE',
    validation_code_hash VARCHAR(255) NULL,
    estimated_weight_kg NUMERIC(10, 2) NULL,
    actual_weight_kg NUMERIC(10, 2) NULL,
    weight_verified_by userrole NULL,
    weight_verified_at TIMESTAMP WITH TIME ZONE NULL,
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_collections_waste_lot_id FOREIGN KEY (waste_lot_id) REFERENCES waste_lots(id) ON DELETE CASCADE,
    CONSTRAINT fk_collections_collector_id FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_collections_waste_lot_id ON collections(waste_lot_id);
CREATE INDEX ix_collections_collector_id ON collections(collector_id);

-- --- Transactions ---
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    collection_id UUID NOT NULL,
    producer_id UUID NOT NULL,
    collector_id UUID NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,
    net_amount NUMERIC(12, 2) NOT NULL,
    payment_method paymentmethod NOT NULL,
    status transactionstatus NOT NULL DEFAULT 'EN_ATTENTE',
    external_reference VARCHAR(255) NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_transactions_collection_id FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_producer_id FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_collector_id FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX ix_transactions_collection_id ON transactions(collection_id);
CREATE INDEX ix_transactions_producer_id ON transactions(producer_id);
CREATE INDEX ix_transactions_collector_id ON transactions(collector_id);
CREATE INDEX ix_transactions_status ON transactions(status);

-- --- Reward Transactions ---
CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    collection_id UUID NULL,
    action rewardaction NOT NULL,
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reward_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reward_transactions_collection_id FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
);

CREATE INDEX ix_reward_transactions_user_id ON reward_transactions(user_id);
CREATE INDEX ix_reward_transactions_collection_id ON reward_transactions(collection_id);

-- Conditional Unique Index to prevent double points credit for a single collection
CREATE UNIQUE INDEX uq_reward_transaction_collection_completed 
ON reward_transactions(collection_id) 
WHERE (action = 'COLLECTION_COMPLETED');

-- --- Reviews ---
CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    collection_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewed_id UUID NOT NULL,
    reviewer_role userrole NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reviews_collection_id FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer_id FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewed_id FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_collection_reviewer UNIQUE (collection_id, reviewer_id)
);

CREATE INDEX ix_reviews_collection_id ON reviews(collection_id);
CREATE INDEX ix_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX ix_reviews_reviewed_id ON reviews(reviewed_id);

-- --- Notifications ---
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    type notificationtype NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id UUID NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ix_notifications_user_id ON notifications(user_id);

-- --- Audit Logs ---
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID NULL,
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX ix_audit_logs_entity_id ON audit_logs(entity_id);
