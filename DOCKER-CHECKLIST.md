# Docker Setup Checklist

Use this checklist to verify your Docker setup is complete and ready for deployment.

## Pre-Deployment Checklist

### Files Created ✓

- [x] docker-compose.yml (production)
- [x] docker-compose.dev.yml (development)
- [x] .env.docker (environment template)
- [x] .dockerignore (frontend)
- [x] Dockerfile (frontend production)
- [x] Dockerfile.dev (frontend development)
- [x] nginx.conf (with API proxy)
- [x] backend/Dockerfile (backend production)
- [x] backend/Dockerfile.dev (backend development)
- [x] backend/.dockerignore (backend)
- [x] backend/database/docker-init.sql (database initialization)
- [x] README.docker.md (comprehensive documentation)
- [x] DOCKER-QUICKSTART.md (quick start guide)
- [x] DOCKER-SETUP-SUMMARY.md (configuration overview)

### Configuration Verified ✓

- [x] YAML syntax validated
- [x] Nginx proxy configured for /api/* requests
- [x] Database initialization script is idempotent
- [x] Health checks configured for all services
- [x] CORS configuration includes FRONTEND_URL
- [x] Multi-stage build for frontend optimization
- [x] Non-root user in backend container
- [x] Persistent volume for database
- [x] Custom network for service communication
- [x] Environment variables properly configured

## First-Time Setup

### 1. Environment Configuration

- [ ] Copy .env.docker to .env:
  ```bash
  cp .env.docker .env
  ```

- [ ] Edit .env file:
  - [ ] Change JWT_SECRET to a secure random value
    ```bash
    openssl rand -base64 32
    ```
  - [ ] Change DB_PASSWORD (if needed)
  - [ ] Verify ports are available (4200, 3000, 5432)
  - [ ] Set FRONTEND_URL if different from localhost

### 2. Build and Start

- [ ] Build all images:
  ```bash
  docker-compose build
  ```

- [ ] Start all services:
  ```bash
  docker-compose up -d
  ```

- [ ] Wait for services to become healthy:
  ```bash
  docker-compose ps
  # Wait until all services show "healthy" status
  ```

### 3. Verify Services

- [ ] Check database:
  ```bash
  docker-compose exec database psql -U postgres -d estacionamento -c "\dt"
  # Should show: users, vehicles tables
  ```

- [ ] Check backend health:
  ```bash
  curl http://localhost:3000/health
  # Should return: {"status":"ok",...}
  ```

- [ ] Check frontend:
  ```bash
  curl http://localhost:4200/health
  # Should return: healthy
  ```

### 4. Create First User

- [ ] Register a user via API:
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"senha123"}'
  ```

- [ ] Or register via web interface:
  - [ ] Open http://localhost:4200
  - [ ] Click "Registrar"
  - [ ] Create account

### 5. Test Complete Flow

- [ ] Login via web interface
- [ ] Add a vehicle
- [ ] View vehicle list
- [ ] Process checkout
- [ ] Verify data persistence:
  ```bash
  docker-compose restart backend
  # Data should still be there after restart
  ```

## Development Mode Setup

### Start Development Environment

- [ ] Start with hot-reload:
  ```bash
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
  ```

- [ ] Verify hot-reload works:
  - [ ] Edit a frontend file (e.g., src/app/components/login/login.component.html)
  - [ ] Browser should auto-reload
  - [ ] Edit a backend file (e.g., backend/src/server.js)
  - [ ] Server should auto-restart

### Development Workflow

- [ ] Frontend changes reflect immediately
- [ ] Backend restarts on file changes
- [ ] Database persists across restarts
- [ ] Logs are visible in console

## Production Deployment Checklist

### Security Hardening

- [ ] **CRITICAL**: Change JWT_SECRET in .env
  ```bash
  # Generate strong secret
  openssl rand -base64 32
  # Add to .env file
  ```

- [ ] **CRITICAL**: Change DB_PASSWORD in .env
  ```bash
  # Generate strong password
  openssl rand -base64 24
  # Add to .env file
  ```

- [ ] Verify NODE_ENV=production in .env

- [ ] Review CORS configuration:
  - [ ] Set FRONTEND_URL to production domain

### Infrastructure

- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Configure SSL certificates (Let's Encrypt)
- [ ] Set up firewall rules
- [ ] Configure resource limits:
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
  ```

### Monitoring

- [ ] Set up log aggregation
- [ ] Configure health check monitoring
- [ ] Set up alerts for service failures
- [ ] Configure database backup automation:
  ```bash
  # Create backup script
  0 2 * * * docker-compose exec -T database pg_dump -U postgres estacionamento > /backups/backup_$(date +\%Y\%m\%d).sql
  ```

### Testing

- [ ] Load testing completed
- [ ] Security scan completed
- [ ] Backup and restore tested
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

## Maintenance Checklist

### Regular Tasks

#### Daily
- [ ] Check service health:
  ```bash
  docker-compose ps
  ```

- [ ] Review logs for errors:
  ```bash
  docker-compose logs --tail=100
  ```

#### Weekly
- [ ] Check disk usage:
  ```bash
  docker system df
  ```

- [ ] Review database size:
  ```bash
  docker-compose exec database psql -U postgres -d estacionamento -c "SELECT pg_size_pretty(pg_database_size('estacionamento'));"
  ```

#### Monthly
- [ ] Update Docker images:
  ```bash
  docker-compose pull
  docker-compose up -d
  ```

- [ ] Clean unused resources:
  ```bash
  docker image prune -a
  docker volume prune
  ```

- [ ] Test backup restore:
  ```bash
  # Create backup
  docker-compose exec -T database pg_dump -U postgres estacionamento > test_backup.sql

  # Restore to verify
  docker-compose exec -T database psql -U postgres estacionamento < test_backup.sql
  ```

### Emergency Procedures

#### Service Down
- [ ] Check logs:
  ```bash
  docker-compose logs -f [service-name]
  ```

- [ ] Restart service:
  ```bash
  docker-compose restart [service-name]
  ```

- [ ] If restart fails, rebuild:
  ```bash
  docker-compose up -d --build [service-name]
  ```

#### Database Corruption
- [ ] Stop all services:
  ```bash
  docker-compose down
  ```

- [ ] Restore from backup:
  ```bash
  docker-compose up -d database
  docker-compose exec -T database psql -U postgres estacionamento < backup.sql
  docker-compose up -d
  ```

#### Rollback
- [ ] Stop services:
  ```bash
  docker-compose down
  ```

- [ ] Restore previous version:
  ```bash
  git checkout [previous-commit]
  docker-compose up -d --build
  ```

## Troubleshooting Checklist

### Services Won't Start

- [ ] Check Docker is running:
  ```bash
  docker ps
  ```

- [ ] Verify .env file exists:
  ```bash
  ls -la .env
  ```

- [ ] Check ports are available:
  ```bash
  sudo lsof -i :4200
  sudo lsof -i :3000
  sudo lsof -i :5432
  ```

- [ ] View service logs:
  ```bash
  docker-compose logs
  ```

### Database Connection Issues

- [ ] Verify database is healthy:
  ```bash
  docker-compose ps database
  ```

- [ ] Check database logs:
  ```bash
  docker-compose logs database
  ```

- [ ] Test connection:
  ```bash
  docker-compose exec database psql -U postgres -d estacionamento -c "SELECT 1;"
  ```

- [ ] Verify environment variables:
  ```bash
  docker-compose exec backend env | grep DB_
  ```

### Frontend Can't Reach Backend

- [ ] Check nginx configuration:
  ```bash
  docker-compose exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api"
  ```

- [ ] Test backend from frontend container:
  ```bash
  docker-compose exec frontend wget -O- http://backend:3000/health
  ```

- [ ] Verify network connectivity:
  ```bash
  docker network inspect estacionamento-network
  ```

### Performance Issues

- [ ] Check resource usage:
  ```bash
  docker stats
  ```

- [ ] Check database indexes:
  ```bash
  docker-compose exec database psql -U postgres -d estacionamento -c "\di"
  ```

- [ ] Review slow queries (if logging enabled)

- [ ] Check disk space:
  ```bash
  df -h
  docker system df
  ```

## Completion Sign-off

### Development Environment
- [ ] All services start successfully
- [ ] Hot-reload works for frontend and backend
- [ ] Database initialization completes
- [ ] Can create users and vehicles
- [ ] Data persists across restarts

### Production Environment
- [ ] Security hardening completed
- [ ] SSL/HTTPS configured
- [ ] Monitoring set up
- [ ] Backups automated
- [ ] Disaster recovery tested
- [ ] Documentation reviewed

### Team Handoff
- [ ] README.docker.md reviewed
- [ ] DOCKER-QUICKSTART.md provided
- [ ] Environment variables documented
- [ ] Emergency procedures documented
- [ ] Access credentials secured
- [ ] Contact information updated

---

## Quick Reference Commands

```bash
# Start production
docker-compose up -d --build

# Start development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop all
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Backup database
docker-compose exec -T database pg_dump -U postgres estacionamento > backup.sql

# Restore database
docker-compose exec -T database psql -U postgres estacionamento < backup.sql

# Clean up
docker system prune -a --volumes
```

---

**Date Completed**: _________________

**Completed By**: _________________

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
