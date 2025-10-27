# Docker Setup - Complete Configuration Summary

## Overview

Your parking management system now has a complete, production-ready Docker configuration with the following components:

## File Structure

```
/home/fabio/Documentos/Projetos/estacionamento/
├── docker-compose.yml              # Production configuration
├── docker-compose.dev.yml          # Development overrides
├── .env.docker                     # Environment template
├── .env                            # Your local environment (not in git)
├── .dockerignore                   # Frontend exclusions
├── Dockerfile                      # Frontend production build
├── Dockerfile.dev                  # Frontend development build
├── nginx.conf                      # Nginx configuration with API proxy
├── README.docker.md                # Comprehensive documentation
├── DOCKER-QUICKSTART.md            # Quick start guide
└── backend/
    ├── Dockerfile                  # Backend production build
    ├── Dockerfile.dev              # Backend development build
    ├── .dockerignore               # Backend exclusions
    └── database/
        ├── docker-init.sql         # PostgreSQL initialization
        ├── setup.sql               # Manual setup script
        └── schema.sql              # Database schema
```

## Services Architecture

### 1. PostgreSQL Database (estacionamento-db)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: estacionamento-postgres-data (persistent)
- **Initialization**: Automatic via docker-init.sql
- **Health Check**: pg_isready every 10s
- **Features**:
  - UUID extension enabled
  - Custom ENUM types for vehicle status
  - Automatic timestamp updates via triggers
  - Optimized indexes for queries
  - Unique constraint for active vehicle plates

### 2. Node.js Backend (estacionamento-backend)
- **Base Image**: node:20-alpine
- **Port**: 3000
- **Framework**: Express 5
- **Database Client**: node-postgres (pg)
- **Authentication**: JWT with bcrypt
- **Health Check**: /health endpoint every 30s
- **Security**:
  - Non-root user (nodejs:1001)
  - Production-only dependencies
  - CORS configured for frontend origin
  - Graceful shutdown handling
  - Prepared statements (SQL injection prevention)

### 3. Angular Frontend (estacionamento-frontend)
- **Build Image**: node:20-alpine
- **Serve Image**: nginx:alpine
- **Port**: 4200 (host) → 80 (container)
- **Build Strategy**: Multi-stage
  - Stage 1: Build Angular app
  - Stage 2: Serve with nginx
- **Features**:
  - API proxy to backend (/api/* → http://backend:3000/api/*)
  - Gzip compression enabled
  - Static asset caching (1 year)
  - Security headers configured
  - SPA routing support
  - Health check endpoint

## Network Configuration

All services communicate through a custom bridge network: **estacionamento-network**

```
Frontend (nginx) ──[/api/*]──> Backend (Express) ──[SQL]──> Database (PostgreSQL)
     ↓                              ↓                            ↓
http://frontend:80         http://backend:3000         database:5432
```

## Key Improvements Made

### 1. Nginx API Proxy Configuration
**Problem**: Frontend in production uses relative URL `/api`, but backend is in separate container.

**Solution**: Added proxy configuration in nginx.conf:
```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;
    # ... headers and timeout settings
}
```

This allows the frontend to make requests to `/api/auth/login` which are automatically proxied to the backend container.

### 2. CORS Configuration
**Backend Environment**: Added `FRONTEND_URL` variable
```yaml
environment:
  FRONTEND_URL: ${FRONTEND_URL:-http://localhost:4200}
```

This allows the backend to accept requests from the frontend origin.

### 3. Database Initialization
**Docker-Compatible Script**: Created `docker-init.sql` that:
- Uses `CREATE IF NOT EXISTS` for idempotency
- Handles duplicate objects gracefully
- Provides startup feedback via RAISE NOTICE
- Works with PostgreSQL's /docker-entrypoint-initdb.d/ mechanism

## Environment Variables

### Production (.env)
```env
# Database
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=postgres123                    # CHANGE IN PRODUCTION!

# Ports
FRONTEND_PORT=4200
BACKEND_PORT=3000
DB_PORT=5432

# JWT
JWT_SECRET=change-this-secret-in-production  # CRITICAL: CHANGE THIS!
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:4200

# Environment
NODE_ENV=production
```

### Development Overrides
Development mode uses the same base configuration but with:
- Source code volume mounts for hot-reload
- Nodemon for backend auto-restart
- Angular dev server with polling
- All dependencies installed (including devDependencies)

## Docker Commands Reference

### Production
```bash
# Start all services
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### Development
```bash
# Start with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Database Management
```bash
# Connect to PostgreSQL
docker-compose exec database psql -U postgres -d estacionamento

# Backup
docker-compose exec -T database pg_dump -U postgres estacionamento > backup.sql

# Restore
docker-compose exec -T database psql -U postgres estacionamento < backup.sql

# Reset (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Maintenance
```bash
# Rebuild specific service
docker-compose build backend

# Clean Docker cache
docker builder prune -a

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Health Checks

All services have health checks configured:

### Database
- Command: `pg_isready`
- Interval: 10s
- Timeout: 5s
- Start period: 10s

### Backend
- Command: `wget http://localhost:3000/health`
- Interval: 30s
- Timeout: 10s
- Start period: 40s (allows time for DB connection)

### Frontend
- Command: `wget http://localhost/`
- Interval: 30s
- Timeout: 10s
- Start period: 10s (60s in dev mode)

## Security Considerations

### Implemented
1. Non-root user in backend container
2. bcrypt password hashing (10 rounds)
3. JWT authentication with configurable expiration
4. CORS protection
5. Security headers in nginx
6. Prepared statements in database queries
7. Environment-based secrets
8. Health checks for monitoring

### Production Recommendations
1. **Change JWT_SECRET**: Use strong random value
   ```bash
   openssl rand -base64 32
   ```

2. **Change Database Password**: Use strong password
   ```bash
   openssl rand -base64 24
   ```

3. **Use HTTPS**: Deploy behind reverse proxy with SSL
   - Let's Encrypt for free certificates
   - Nginx or Traefik as reverse proxy

4. **Restrict Port Exposure**: Only expose 80/443 publicly
   ```yaml
   # Remove or comment out port mappings for backend/db
   # Only expose frontend through reverse proxy
   ```

5. **Enable Docker Secrets**: For production orchestration
   ```yaml
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

6. **Resource Limits**: Add resource constraints
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

7. **Regular Updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Build Process

### Frontend Build (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/parking-app/browser /usr/share/nginx/html
```

**Result**: ~50MB optimized image with only production assets

### Backend Build
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

**Result**: ~180MB image with production dependencies only

## Volumes

### Persistent Volumes
- **estacionamento-postgres-data**: Database storage
  - Survives container restarts
  - Survives `docker-compose down`
  - Only deleted with `docker-compose down -v`

### Development Volumes (temporary)
- Frontend source code mount
- Backend source code mount
- Configuration files mount
- Enable hot-reload without rebuilding

## Network Traffic Flow

1. **User → http://localhost:4200**
   - Reaches nginx in frontend container

2. **Frontend → /api/auth/login**
   - Nginx proxies to http://backend:3000/api/auth/login

3. **Backend → database:5432**
   - PostgreSQL connection via internal network

4. **Backend → Frontend**
   - CORS headers allow response

5. **Frontend → User**
   - Response with JWT token

## Performance Optimizations

### Frontend
- Gzip compression enabled
- Static asset caching (1 year)
- No caching for index.html (always fresh)
- Multi-stage build (smaller image)

### Backend
- Production dependencies only
- Connection pooling for PostgreSQL
- Graceful shutdown handling
- Health checks prevent failed requests

### Database
- Optimized indexes on frequently queried columns
- Partial unique index for active vehicles
- Automatic timestamp updates via triggers
- Alpine-based image (smaller size)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port in .env file
   - Kill process using the port

2. **Database Connection Failed**
   - Check database health: `docker-compose ps`
   - View logs: `docker-compose logs database`
   - Wait for health check to pass

3. **Frontend Can't Reach Backend**
   - Verify nginx proxy configuration
   - Check backend health: `curl http://localhost:3000/health`
   - View nginx logs: `docker-compose logs frontend`

4. **Hot Reload Not Working**
   - Using dev compose file?
   - Check volume mounts: `docker-compose config`
   - Increase file watchers (Linux):
     ```bash
     echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
     sudo sysctl -p
     ```

5. **Build Failures**
   - Clear Docker cache: `docker builder prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

## Testing the Setup

### 1. Start Services
```bash
cp .env.docker .env
docker-compose up -d --build
```

### 2. Check Health
```bash
# All services should be "healthy"
docker-compose ps

# Backend health
curl http://localhost:3000/health

# Frontend health
curl http://localhost:4200/health
```

### 3. Create User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

### 5. Access Frontend
Open http://localhost:4200 in your browser

## Next Steps

1. **Copy environment template**:
   ```bash
   cp .env.docker .env
   ```

2. **Edit .env with your values**:
   - Change JWT_SECRET to a secure value
   - Change DB_PASSWORD if needed
   - Adjust ports if needed

3. **Start the application**:
   ```bash
   docker-compose up -d --build
   ```

4. **Create your first user**:
   - Via API or web interface

5. **Start developing**:
   - For hot-reload: use docker-compose.dev.yml

## Documentation Files

- **README.docker.md**: Comprehensive guide with detailed troubleshooting
- **DOCKER-QUICKSTART.md**: Quick reference for common commands
- **DOCKER-SETUP-SUMMARY.md**: This file - complete configuration overview
- **CLAUDE.md**: Project documentation and architecture

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Check resources: `docker stats`
4. Review health: `docker-compose ps`
5. Consult README.docker.md for detailed troubleshooting

## Summary

Your Docker setup is **production-ready** with:
- ✅ Complete containerization of all services
- ✅ Multi-stage builds for optimization
- ✅ Health checks for reliability
- ✅ Development mode with hot-reload
- ✅ Secure configuration with JWT and CORS
- ✅ Persistent database storage
- ✅ Nginx proxy for API requests
- ✅ Comprehensive documentation
- ✅ Easy deployment and scaling

The setup follows Docker and security best practices and is ready for both development and production deployment.
