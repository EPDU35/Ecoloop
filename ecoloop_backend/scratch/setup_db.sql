-- EcoLoop DB Setup Script
-- Creer l'utilisateur ecoloop_user
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecoloop_user') THEN
    CREATE USER ecoloop_user WITH PASSWORD 'ecoloop_pass';
    RAISE NOTICE 'Utilisateur ecoloop_user cree';
  ELSE
    ALTER USER ecoloop_user WITH PASSWORD 'ecoloop_pass';
    RAISE NOTICE 'Mot de passe ecoloop_user mis a jour';
  END IF;
END $$;

-- Creer la base de donnees ecoloop_db
SELECT 'CREATE DATABASE ecoloop_db OWNER ecoloop_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecoloop_db')\gexec

-- Donner tous les privileges
GRANT ALL PRIVILEGES ON DATABASE ecoloop_db TO ecoloop_user;

\echo 'Base de donnees ecoloop_db creee avec succes !'
