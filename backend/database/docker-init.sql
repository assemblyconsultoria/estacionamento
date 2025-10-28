-- Docker initialization script for PostgreSQL
-- This script is automatically executed when the database container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for vehicle status
DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('estacionado', 'retirado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    placa VARCHAR(20) NOT NULL,
    data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_saida TIMESTAMP WITH TIME ZONE,
    valor_total NUMERIC(10, 2),
    status vehicle_status NOT NULL DEFAULT 'estacionado',
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_vehicles_placa ON vehicles(placa);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_data_entrada ON vehicles(data_entrada);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Unique index for active vehicles (prevents duplicate plates while parked)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_active_placa ON vehicles(placa)
WHERE status = 'estacionado';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist (to avoid errors on recreate)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message (visible in docker logs)
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Tables created: users, vehicles';
    RAISE NOTICE 'Ready to accept connections from backend service';
END $$;
