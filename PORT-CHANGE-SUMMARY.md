# PostgreSQL Port Change Summary

## Overview

The Docker configuration has been updated to use **port 5430** for external PostgreSQL access instead of port 5432. This change prevents conflicts with local PostgreSQL installations running on the default port 5432.

## What Changed

### Port Mapping Details

**Before:**
- External port: 5432
- Internal port: 5432
- Mapping: `5432:5432`

**After:**
- External port: 5430 (host machine access)
- Internal port: 5432 (container internal, unchanged)
- Mapping: `5430:5432`

### Key Concept

The port mapping `5430:5432` means:
- **5430** is the port on your HOST machine (outside Docker) - Use this when connecting from your computer
- **5432** is the port INSIDE the container (PostgreSQL default) - Used by backend container and internal Docker network
- Backend containers communicate using `database:5432` (internal network)
- Host machine connects using `localhost:5430` (external access)

## Files Modified

### 1. docker-compose.yml
**Changes:**
- Line 18: Port mapping changed from `"${DB_PORT:-5430}:5430"` to `"${DB_PORT:-5430}:5432"`
- Line 40: Backend DB_PORT kept as `5432` (for internal container communication)

**Rationale:**
- External port 5430 maps to internal port 5432
- Backend uses internal network, so it connects to `database:5432`

### 2. docker-compose.dev.yml
**Changes:**
- Line 9: Port mapping changed from `"5432:5432"` to `"5430:5432"`

**Rationale:**
- Development mode also uses port 5430 externally for consistency

### 3. .env.docker
**Changes:**
- DB_PORT value: Changed from `5432` to `5430`
- Added comprehensive comments explaining port mapping

**New content:**
```env
# Database Port (External Access)
# This is the port on your HOST machine (outside Docker)
# Use this port when connecting from your computer: localhost:5430
# Inside Docker, containers use the internal port 5432
# Changed from 5432 to 5430 to avoid conflicts with local PostgreSQL
DB_PORT=5430
```

### 4. README.docker.md
**Changes:**
- Updated all connection examples to use port 5430
- Added section explaining port mapping in "Database Connection"
- Updated architecture diagram to show `5430:5432 (host:container)`
- Updated environment variables table

**Key sections updated:**
- Access the Application section
- Production Environment Variables
- Database Connection section
- Architecture diagram
- All psql command examples

### 5. DOCKER-QUICKSTART.md
**Changes:**
- Updated architecture diagram to show port `5430:5432`
- Updated environment variables section
- Added both container and host access examples for PostgreSQL

### 6. DOCKER-SETUP-SUMMARY.md
**Changes:**
- Updated PostgreSQL service port description with detailed explanation
- Updated environment variables section
- Updated database connection commands to show both methods

### 7. DOCKER-CHECKLIST.md
**Changes:**
- Updated port verification commands to check port 5430
- Added both Docker and host connection test commands
- Updated notes about available ports

## Connection Examples

### From Host Machine (Your Computer)
```bash
# Connect to PostgreSQL from outside Docker
psql -h localhost -p 5430 -U postgres -d estacionamento

# Using database clients (PgAdmin, DBeaver, etc.)
Host: localhost
Port: 5430
Database: estacionamento
User: postgres
```

### From Backend Container (Inside Docker)
The backend container connects using the internal network:
```javascript
// Backend configuration (automatic, no changes needed)
DB_HOST=database
DB_PORT=5432
```

### Docker Commands
```bash
# Connect via Docker (uses internal network)
docker-compose exec database psql -U postgres -d estacionamento

# Backup from host
docker-compose exec -T database pg_dump -U postgres estacionamento > backup.sql

# Restore from host
docker-compose exec -T database psql -U postgres estacionamento < backup.sql
```

## Why This Change?

### Problem
Many developers have PostgreSQL installed locally on their machines, which runs on the default port 5432. When Docker tries to use the same port, it creates a conflict:
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

### Solution
By mapping the external port to 5430, Docker's PostgreSQL can coexist with a local PostgreSQL installation:
- Local PostgreSQL: Uses port 5432 on host
- Docker PostgreSQL: Uses port 5430 on host, 5432 internally

### Benefits
1. **No Conflicts**: Can run both local and Docker PostgreSQL simultaneously
2. **No Backend Changes**: Backend code doesn't need modification (uses internal port)
3. **Clear Separation**: Easy to distinguish between local and Docker databases
4. **Standard Practice**: Common approach for containerized databases

## Verification Steps

After pulling these changes, verify the configuration:

### 1. Check Docker Compose Configuration
```bash
# View the resolved configuration
docker-compose config | grep -A 5 "ports:"
```

Expected output should show:
```yaml
ports:
- published: 5430
  target: 5432
```

### 2. Start Services
```bash
docker-compose down
docker-compose up -d --build
```

### 3. Verify Port Binding
```bash
# Check that port 5430 is bound
sudo netstat -tulpn | grep 5430
# or
sudo lsof -i :5430
```

### 4. Test Connection from Host
```bash
# Should connect successfully
psql -h localhost -p 5430 -U postgres -d estacionamento -c "SELECT version();"
```

### 5. Verify Backend Can Connect
```bash
# Check backend logs for successful database connection
docker-compose logs backend | grep -i "database\|postgres\|connected"
```

## Troubleshooting

### Issue: Port 5430 Already in Use
```bash
# Check what's using port 5430
sudo lsof -i :5430

# If needed, change to another port in .env
DB_PORT=5431
docker-compose down
docker-compose up -d
```

### Issue: Backend Can't Connect to Database
This should NOT happen as backend uses internal network (port 5432). If it does:

```bash
# Check backend environment
docker-compose exec backend env | grep DB_

# Should show:
# DB_HOST=database
# DB_PORT=5432  (not 5430!)
```

### Issue: Host Can't Connect on Port 5430
```bash
# Verify container is running and healthy
docker-compose ps

# Check port mapping
docker-compose port database 5432
# Should output: 0.0.0.0:5430
```

## Migration Notes

If you were using the old configuration with port 5432:

### For Development
1. Update your .env file: Change `DB_PORT=5432` to `DB_PORT=5430`
2. Update any scripts or tools that connect to `localhost:5432` to use `localhost:5430`
3. Restart Docker services: `docker-compose down && docker-compose up -d`

### For Production
1. Update environment variables on your server
2. Update any monitoring or backup scripts that reference port 5432
3. Update firewall rules if port-specific rules exist
4. Redeploy containers with new configuration

### Database Clients
Update connection settings in:
- PgAdmin
- DBeaver
- TablePlus
- psql command shortcuts
- Any custom scripts

Change port from 5432 to 5430 when connecting to localhost.

## Summary

The configuration is now optimized for development environments where local PostgreSQL might already be running. The change is transparent to the application code and only affects how external tools connect to the database.

**Key Takeaway:**
- External connections: Use `localhost:5430`
- Internal containers: Still use `database:5432` (no changes needed)

---

**Date of Change:** 2025-10-26
**Configuration Version:** 1.1
**Breaking Change:** No (only affects external port, internal behavior unchanged)
