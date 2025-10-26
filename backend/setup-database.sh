#!/bin/bash

# Script to set up the PostgreSQL database for the parking management system

echo "=========================================="
echo "  Estacionamento Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo ""
    echo "Install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo ""
    exit 1
fi

echo "PostgreSQL found: $(psql --version)"
echo ""

# Get database credentials
DB_USER="${DB_USER:-postgres}"
DB_NAME="projetos"

echo "Setting up database '$DB_NAME'..."
echo ""

# Run setup script
if [ -f "database/setup.sql" ]; then
    echo "Running setup script..."
    psql -U "$DB_USER" -f database/setup.sql

    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "  Database setup completed successfully!"
        echo "=========================================="
        echo ""
        echo "Next steps:"
        echo "  1. Configure .env file (cp .env.example .env)"
        echo "  2. Start the backend: npm run dev"
        echo ""
    else
        echo ""
        echo "ERROR: Failed to set up database"
        echo "Please check your PostgreSQL credentials"
        exit 1
    fi
else
    echo "ERROR: database/setup.sql not found"
    exit 1
fi
