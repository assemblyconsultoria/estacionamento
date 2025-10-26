-- Quick setup script for database
-- Run this as postgres user: psql -U postgres -f setup.sql

-- Create the database
DROP DATABASE IF EXISTS estacionamento;
CREATE DATABASE estacionamento;

-- Connect to the new database
\c estacionamento;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for vehicle status
CREATE TYPE vehicle_status AS ENUM ('estacionado', 'retirado');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
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

-- Create indexes
CREATE INDEX idx_vehicles_placa ON vehicles(placa);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_data_entrada ON vehicles(data_entrada);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_users_username ON users(username);

-- Unique index for active vehicles
CREATE UNIQUE INDEX idx_vehicles_active_placa ON vehicles(placa)
WHERE status = 'estacionado';

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
\echo 'Database setup completed successfully!'
\echo 'You can now start the backend server.'
