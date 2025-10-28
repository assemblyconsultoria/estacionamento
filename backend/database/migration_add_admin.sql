-- Migration: Add is_admin field to users table
-- Description: Adds is_admin boolean field to support admin users

\c estacionamento;

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update the first user to be admin if exists
UPDATE users SET is_admin = TRUE WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Create index for admin users
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
