# Migration Guide: localStorage to PostgreSQL

This guide explains the migration from localStorage-based data persistence to a PostgreSQL database with REST API backend.

## What Changed

### Before (localStorage)
- All data stored in browser localStorage
- No real authentication (just token simulation)
- Data lost when clearing browser cache
- No multi-user support
- Limited to single browser/device

### After (PostgreSQL + REST API)
- Data persisted in PostgreSQL database
- Real JWT authentication with bcrypt password hashing
- Data accessible from any device
- Multi-user support
- Scalable architecture

## Migration Steps

### 1. Install PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

### 2. Set Up Database

Option A - Using the setup script (recommended):
```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

Option B - Manual setup:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Run the setup SQL
\i /path/to/backend/database/setup.sql

# Or create manually:
CREATE DATABASE estacionamento;
\c estacionamento
\i /path/to/backend/database/schema.sql
```

### 3. Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

Update the `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=your_postgres_password

PORT=3000
NODE_ENV=development

JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRES_IN=24h
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Connected to PostgreSQL database
Database connection test successful
==========================================================
  Estacionamento API Server
==========================================================
  Environment: development
  Server running on: http://localhost:3000
  API documentation: http://localhost:3000/api
  Health check: http://localhost:3000/health
==========================================================
```

### 5. Verify Backend

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T...",
  "uptime": 1.234
}
```

### 6. Create First User

Since the system now requires real authentication, create a user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "...",
    "username": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 7. Start Frontend

In a new terminal:
```bash
# From project root
ng serve
```

Access: http://localhost:4200

### 8. Login to Application

Use the credentials you created:
- Username: `admin`
- Password: `senha123`

## Migrating Existing Data

If you have existing data in localStorage, you can migrate it:

### Export localStorage Data

Open browser console on http://localhost:4200 and run:
```javascript
// Get existing vehicles from localStorage
const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
console.log(JSON.stringify(vehicles, null, 2));
```

### Import to Database

For each vehicle, use the API:
```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}' \
  | jq -r '.token')

# Add each vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-1234"
  }'
```

## Running Both Servers

You need both backend and frontend running:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
ng serve
```

## API Changes

### Auth Service

**Before:**
```typescript
// Synchronous, returns boolean
const success = this.authService.login(usuario, senha);
if (success) {
  this.router.navigate(['/parking']);
}
```

**After:**
```typescript
// Asynchronous, returns Observable
this.authService.login(usuario, senha).subscribe({
  next: (success) => {
    if (success) {
      this.router.navigate(['/parking']);
    }
  },
  error: (error) => {
    console.error('Login error:', error);
  }
});
```

### Parking Service

**Before:**
```typescript
// Synchronous, void return
this.parkingService.addVehicle(marca, modelo, placa);
this.vehicleAdded.emit();
```

**After:**
```typescript
// Asynchronous, returns Observable<Vehicle>
this.parkingService.addVehicle(marca, modelo, placa).subscribe({
  next: (vehicle) => {
    this.vehicleAdded.emit();
  },
  error: (error) => {
    console.error('Error adding vehicle:', error);
  }
});
```

## Troubleshooting

### "Cannot connect to database"
1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```
2. Verify credentials in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d estacionamento
   ```

### "Port 3000 already in use"
Change the port in `.env`:
```env
PORT=3001
```

And update frontend environment:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

### "CORS error" in browser console
Ensure backend CORS is configured to accept requests from `http://localhost:4200`.

Check `backend/src/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
```

### "401 Unauthorized" on API requests
1. Ensure you're logged in
2. Check if token is being sent in headers
3. Token may have expired (default: 24h) - login again

### Database already exists error
Drop and recreate:
```bash
sudo -u postgres psql -c "DROP DATABASE estacionamento;"
sudo -u postgres psql -c "CREATE DATABASE estacionamento;"
cd backend
./setup-database.sh
```

## Rollback Plan

If you need to rollback to localStorage:

1. Stop the backend server
2. Checkout the previous git commit:
   ```bash
   git log --oneline  # Find commit before migration
   git checkout <commit-hash>
   ```
3. Your localStorage data should still be intact in the browser

## Testing the Migration

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Test Vehicle Operations
```bash
# Get token from login
TOKEN="your_token_here"

# Add vehicle
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"marca":"Honda","modelo":"Civic","placa":"XYZ-5678"}'

# List parked vehicles
curl http://localhost:3000/api/vehicles/estacionados \
  -H "Authorization: Bearer $TOKEN"

# Checkout vehicle
curl -X PUT http://localhost:3000/api/vehicles/{vehicle_id}/checkout \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Frontend
1. Open http://localhost:4200
2. Login with created credentials
3. Add a vehicle
4. Verify it appears in the list
5. Checkout the vehicle
6. Verify the value calculation

## Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Never commit `.env` files to version control
- Use environment-specific configurations
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Regular database backups

## Performance Considerations

- Database connection pooling is configured (max 20 connections)
- Indexes are created on frequently queried columns
- Use transactions for critical operations
- Monitor database performance with PostgreSQL tools

## Next Steps

After successful migration:

1. Remove localStorage fallback code (if any)
2. Set up database backups
3. Configure production environment
4. Implement monitoring and logging
5. Add integration tests
6. Document API changes for team

## Support

For issues:
1. Check logs: `backend/` directory
2. Review CLAUDE.md for detailed setup
3. Check backend/README.md for API documentation
