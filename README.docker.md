# Docker Setup Guide - Sistema de Gerenciamento de Estacionamento

This guide provides comprehensive instructions for running the Parking Management System using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Setup](#production-setup)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [Service Management](#service-management)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
  ```bash
  docker --version
  ```

- **Docker Compose**: Version 2.0 or higher
  ```bash
  docker-compose --version
  ```

### Installing Docker

#### Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### macOS
```bash
# Install using Homebrew
brew install --cask docker

# Or download Docker Desktop from:
# https://www.docker.com/products/docker-desktop
```

#### Windows
Download and install Docker Desktop from:
https://www.docker.com/products/docker-desktop

## Quick Start

Get the application running in 3 simple steps:

### 1. Configure Environment Variables

```bash
# Copy the environment template
cp .env.docker .env

# Edit the .env file with your preferred values
nano .env  # or use any text editor
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

### 2. Build and Start Services

```bash
# Build and start all services in detached mode
docker-compose up -d --build
```

This command will:
- Build the frontend (Angular) image
- Build the backend (Node.js) image
- Pull the PostgreSQL image
- Create and initialize the database
- Start all three services

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

### 4. Create Your First User

Since the database starts empty, you need to register a user:

#### Option 1: Use the Registration UI
1. Navigate to http://localhost:4200
2. Click on "Registrar" (if available)
3. Create your account

#### Option 2: Use the API directly
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "senha123"
  }'
```

## Production Setup

### Build for Production

```bash
# Build all images
docker-compose build

# Start services in detached mode
docker-compose up -d
```

### Production Environment Variables

Edit your `.env` file with production values:

```env
# Database Configuration
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=3000

# Frontend Configuration
FRONTEND_PORT=4200

# JWT Configuration (CRITICAL: Use a strong secret!)
JWT_SECRET=your-very-long-random-secret-string-min-32-characters
JWT_EXPIRES_IN=24h

# Environment
NODE_ENV=production
```

### Security Considerations for Production

1. **Change JWT Secret**: Generate a strong random secret
   ```bash
   # Generate a secure random secret
   openssl rand -base64 32
   ```

2. **Use Strong Database Password**
   ```bash
   # Generate a secure database password
   openssl rand -base64 24
   ```

3. **Restrict Port Exposure**: Consider using a reverse proxy (nginx/traefik) and only expose ports 80/443

4. **Enable HTTPS**: Use a reverse proxy with SSL certificates (Let's Encrypt)

5. **Regular Updates**: Keep Docker images updated
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Development Setup

For development with hot-reload capabilities:

### Start Development Environment

```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This setup provides:
- **Hot Reload**: Frontend and backend automatically reload on code changes
- **Source Mapping**: Easier debugging with source maps
- **Verbose Logging**: More detailed logs for development
- **Mounted Volumes**: Your local code is mounted into containers

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# In another terminal, view logs
docker-compose logs -f frontend backend

# Make changes to your code - they will automatically reload!

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Accessing Development Services

- **Frontend**: http://localhost:4200 (with hot-reload)
- **Backend API**: http://localhost:3000 (with nodemon)
- **Database**: localhost:5432

## Environment Configuration

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_NAME` | PostgreSQL database name | estacionamento | Yes |
| `DB_USER` | PostgreSQL username | postgres | Yes |
| `DB_PASSWORD` | PostgreSQL password | postgres123 | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | No |
| `BACKEND_PORT` | Backend service port | 3000 | No |
| `FRONTEND_PORT` | Frontend service port | 4200 | No |
| `JWT_SECRET` | Secret key for JWT tokens | (must change) | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | 24h | No |
| `NODE_ENV` | Environment mode | production | No |

### Custom Port Configuration

To run on different ports, edit your `.env` file:

```env
FRONTEND_PORT=8080
BACKEND_PORT=8000
DB_PORT=5433
```

Then restart services:
```bash
docker-compose up -d
```

## Service Management

### Common Commands

#### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# Start with logs visible
docker-compose up
```

#### Stop Services
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop frontend

# Stop and remove volumes (WARNING: deletes database data!)
docker-compose down -v
```

#### View Logs
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 frontend
```

#### Rebuild Services
```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

#### Service Status
```bash
# Check running services
docker-compose ps

# View resource usage
docker stats
```

### Accessing Container Shell

```bash
# Access backend container
docker-compose exec backend sh

# Access database container
docker-compose exec database psql -U postgres -d estacionamento

# Access frontend container
docker-compose exec frontend sh
```

## Database Management

### Database Connection

The database is accessible at:
- **Host**: localhost (from host machine) or `database` (from containers)
- **Port**: 5432
- **Database**: estacionamento
- **User**: postgres
- **Password**: (from .env file)

### Connect to Database

#### From Host Machine
```bash
psql -h localhost -p 5432 -U postgres -d estacionamento
```

#### From Docker Container
```bash
docker-compose exec database psql -U postgres -d estacionamento
```

### Database Backup

#### Create Backup
```bash
# Backup entire database
docker-compose exec -T database pg_dump -U postgres estacionamento > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
docker-compose exec -T database pg_dump -U postgres estacionamento | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Restore Backup
```bash
# Stop backend to prevent conflicts
docker-compose stop backend

# Restore from backup
docker-compose exec -T database psql -U postgres estacionamento < backup_20231215_120000.sql

# Restart backend
docker-compose start backend
```

### Database Reset

```bash
# WARNING: This will delete all data!

# Stop all services
docker-compose down

# Remove database volume
docker volume rm estacionamento-postgres-data

# Start services (database will reinitialize)
docker-compose up -d
```

### View Database Tables

```bash
# Connect to database
docker-compose exec database psql -U postgres -d estacionamento

# List tables
\dt

# View users table
SELECT * FROM users;

# View vehicles table
SELECT * FROM vehicles;

# Exit
\q
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Ports Already in Use

**Error**: `Bind for 0.0.0.0:4200 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
sudo lsof -i :4200

# Kill the process
kill -9 <PID>

# Or change the port in .env file
echo "FRONTEND_PORT=4201" >> .env
docker-compose up -d
```

#### Issue: Database Connection Refused

**Error**: `connect ECONNREFUSED database:5432`

**Solution**:
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs database

# Restart database service
docker-compose restart database

# Wait for health check to pass
docker-compose ps
```

#### Issue: Frontend Shows "Cannot connect to backend"

**Solution**:
1. Check if backend is running:
   ```bash
   docker-compose ps backend
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Test backend health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

4. Verify backend container can reach database:
   ```bash
   docker-compose exec backend sh
   ping database
   ```

#### Issue: "No space left on device"

**Solution**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune

# Remove everything (careful!)
docker system prune -a --volumes
```

#### Issue: Build Fails with npm Errors

**Solution**:
```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check node_modules conflicts
rm -rf node_modules backend/node_modules
docker-compose build
```

#### Issue: Hot Reload Not Working in Development

**Solution**:
1. Ensure you're using the dev compose file:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

2. Check volume mounts:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml config
   ```

3. Increase file watcher limit (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Health Checks

All services have health checks configured. Check their status:

```bash
# View health status
docker-compose ps

# Detailed health check
docker inspect --format='{{json .State.Health}}' estacionamento-backend | jq
```

### View Container Resource Usage

```bash
# Real-time resource usage
docker stats

# Detailed information for a service
docker inspect estacionamento-backend
```

## Architecture

### Services Overview

The application consists of three main services:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (Angular 20)                         │
│  - Container: estacionamento-frontend          │
│  - Image: parking-app-frontend                 │
│  - Port: 4200 → 80                             │
│  - Technology: Angular 20 + nginx              │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP Requests
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Backend (Node.js + Express)                   │
│  - Container: estacionamento-backend           │
│  - Image: parking-app-backend                  │
│  - Port: 3000                                  │
│  - Technology: Node.js 20 + Express 5          │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ SQL Queries
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Database (PostgreSQL)                         │
│  - Container: estacionamento-db                │
│  - Image: postgres:16-alpine                   │
│  - Port: 5432                                  │
│  - Volume: estacionamento-postgres-data        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Network Architecture

All services communicate through a custom bridge network `estacionamento-network`:

- Frontend can communicate with backend at `http://backend:3000`
- Backend can communicate with database at `database:5432`
- All services are isolated from other Docker networks

### Volume Management

#### Persistent Volumes

- **estacionamento-postgres-data**: Stores all database data
  - Location: Docker managed volume
  - Persists: Database tables, user data, vehicle records
  - Backup: Use `pg_dump` to create backups

#### Temporary Volumes (Development Only)

- Source code volumes for hot-reload
- Not used in production
- Defined in `docker-compose.dev.yml`

### Image Sizes (Approximate)

- **Frontend**: ~50MB (production, nginx-alpine based)
- **Backend**: ~180MB (production, node:20-alpine based)
- **Database**: ~240MB (postgres:16-alpine)

### Build Process

#### Frontend Build
1. **Stage 1** (Build): Install dependencies, compile Angular app
2. **Stage 2** (Serve): Copy built files to nginx, configure routing
3. Result: Minimal production image with only built assets

#### Backend Build
1. Install production dependencies only
2. Copy application code
3. Create non-root user for security
4. Set up health checks

## Additional Resources

### API Documentation

Once the backend is running, you can test the API:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### Project Documentation

- Main README: `/CLAUDE.md`
- Project structure and conventions
- Development guidelines

### Docker Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

If you encounter issues not covered in this guide:

1. Check service logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check Docker resources: `docker system df`
4. Review health checks: `docker-compose ps`

## Summary of Commands

```bash
# Production
docker-compose up -d --build           # Start production
docker-compose down                     # Stop all services
docker-compose logs -f                  # View logs

# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Database
docker-compose exec database psql -U postgres -d estacionamento  # Connect
docker-compose exec -T database pg_dump -U postgres estacionamento > backup.sql  # Backup

# Maintenance
docker-compose restart backend          # Restart service
docker-compose build --no-cache        # Rebuild without cache
docker system prune -a                 # Clean up Docker
```

## License

This project is part of the Parking Management System. Refer to the main project documentation for licensing information.
