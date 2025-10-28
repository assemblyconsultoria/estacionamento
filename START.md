# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js installed (v18+): `node --version`
- [ ] PostgreSQL installed: Check instructions in MIGRATION_GUIDE.md
- [ ] npm installed: `npm --version`

## Quick Setup (5 minutes)

### 1. Database Setup

If PostgreSQL is installed and you have the `postgres` user password:

```bash
# Option A: Using the setup script
cd backend
./setup-database.sh

# Option B: Manual setup
sudo -u postgres psql -f backend/database/setup.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL password
npm run dev
```

Expected output:
```
Connected to PostgreSQL database
Server running on: http://localhost:3000
```

### 3. Create First User

In a new terminal:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

### 4. Frontend Setup

In a new terminal (from project root):
```bash
npm install
ng serve
```

Open browser: http://localhost:4200

### 5. Login

Use credentials:
- Username: `admin`
- Password: `admin123`

## Running the Application

You need **2 terminals**:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
ng serve
```

Then access: http://localhost:4200

## Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Login Test:**
   - Open http://localhost:4200
   - Login with admin/senha123
   - Should redirect to parking page

3. **Add Vehicle Test:**
   - Click "Adicionar Veículo"
   - Fill: Marca: Toyota, Modelo: Corolla, Placa: ABC-1234
   - Click "Adicionar"
   - Vehicle should appear in list

4. **Checkout Test:**
   - Click "Retirar" on the vehicle
   - Confirm the values shown
   - Click "Confirmar Retirada"
   - Vehicle should disappear from list

## Troubleshooting

### PostgreSQL not installed?
See MIGRATION_GUIDE.md section "Install PostgreSQL"

### Backend won't start?
1. Check if PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify `.env` file has correct database credentials
3. Check if port 3000 is available

### Frontend won't connect?
1. Ensure backend is running on http://localhost:3000
2. Check browser console for errors
3. Verify environment.ts has correct API URL

### Can't login?
1. Ensure you created a user (step 3 above)
2. Check backend logs for errors
3. Try creating user again

## Default Configuration

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000
- **Database:** localhost:5432/estacionamento
- **API Base:** http://localhost:3000/api

## Important Files

- `backend/.env` - Backend configuration
- `src/environments/environment.ts` - Frontend API URL
- `backend/database/setup.sql` - Database schema
- `MIGRATION_GUIDE.md` - Detailed migration instructions
- `CLAUDE.md` - Full project documentation

## Need Help?

1. Read MIGRATION_GUIDE.md for detailed setup
2. Check CLAUDE.md for architecture details
3. See backend/README.md for API documentation
4. Review backend logs for errors
