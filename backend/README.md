# Estacionamento Backend API

Backend API for the Parking Management System built with Node.js, Express, and PostgreSQL.

## Features

- RESTful API for parking management
- JWT-based authentication
- PostgreSQL database with connection pooling
- Input validation and error handling
- CORS enabled for frontend integration
- Bcrypt password hashing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret

```bash
cp .env.example .env
```

3. Set up the PostgreSQL database:

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Run the setup script
\i database/setup.sql

# Or manually:
# CREATE DATABASE estacionamento;
# \c estacionamento
# Then run the schema from database/schema.sql
```

## Configuration

Edit the `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your_secure_secret_here
JWT_EXPIRES_IN=24h
```

## Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "username": "admin"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Authenticate a user.

**Request:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "username": "admin"
  },
  "token": "jwt_token_here"
}
```

#### GET /api/auth/user
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/logout
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

### Vehicles

All vehicle endpoints require authentication via JWT token in the Authorization header.

#### GET /api/vehicles
Get all vehicles.

**Query Parameters:**
- `status` (optional): Filter by status ('estacionado' or 'retirado')

**Response:**
```json
{
  "success": true,
  "count": 2,
  "vehicles": [
    {
      "id": "uuid",
      "marca": "Toyota",
      "modelo": "Corolla",
      "placa": "ABC-1234",
      "data_entrada": "2025-01-01T10:00:00Z",
      "data_saida": null,
      "valor_total": null,
      "status": "estacionado",
      "user_id": "uuid",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

#### GET /api/vehicles/estacionados
Get only parked vehicles.

**Response:** Same format as GET /api/vehicles

#### GET /api/vehicles/:id
Get a specific vehicle by ID.

**Response:**
```json
{
  "success": true,
  "vehicle": {
    "id": "uuid",
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-1234",
    "data_entrada": "2025-01-01T10:00:00Z",
    "data_saida": null,
    "valor_total": null,
    "status": "estacionado"
  }
}
```

#### POST /api/vehicles
Add a new vehicle to the parking lot.

**Request:**
```json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "placa": "ABC-1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Veículo adicionado com sucesso",
  "vehicle": {
    "id": "uuid",
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-1234",
    "data_entrada": "2025-01-01T10:00:00Z",
    "status": "estacionado"
  }
}
```

#### PUT /api/vehicles/:id/checkout
Process vehicle checkout and calculate fee.

**Response:**
```json
{
  "success": true,
  "message": "Veículo retirado com sucesso",
  "vehicle": {
    "id": "uuid",
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-1234",
    "data_entrada": "2025-01-01T10:00:00Z",
    "data_saida": "2025-01-01T12:30:00Z",
    "valor_total": 15.00,
    "status": "retirado"
  }
}
```

#### GET /api/vehicles/:id/calcular-valor
Calculate parking fee for a vehicle without checking out.

**Response:**
```json
{
  "success": true,
  "vehicle": { /* vehicle data */ },
  "valor_total": 15.00
}
```

#### GET /api/vehicles/stats
Get parking statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "estacionados": 5,
    "retirados": 120,
    "total": 125,
    "receita_total": 3750.00,
    "ticket_medio": 31.25
  }
}
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Vehicles Table
- `id` (UUID, Primary Key)
- `marca` (VARCHAR)
- `modelo` (VARCHAR)
- `placa` (VARCHAR)
- `data_entrada` (TIMESTAMP)
- `data_saida` (TIMESTAMP, nullable)
- `valor_total` (NUMERIC, nullable)
- `status` (ENUM: 'estacionado', 'retirado')
- `user_id` (UUID, Foreign Key to users)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Business Rules

- Hourly rate: R$ 5.00/hour
- Minimum charge: R$ 5.00
- Charges for started hours (rounded up)
- Formula: `Math.ceil(hoursParked) * 5.00`
- Only one active vehicle per license plate

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message in Portuguese",
  "message": "Error message in English",
  "details": "Additional error details (optional)"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., duplicate entry)
- 500: Internal Server Error

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── vehicleController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── errorHandler.js
│   │   └── validator.js # Input validation
│   ├── models/          # Database models
│   │   ├── User.js
│   │   └── Vehicle.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── vehicles.js
│   └── server.js        # Main server file
├── database/
│   ├── schema.sql       # Database schema
│   └── setup.sql        # Quick setup script
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
└── package.json
```

### Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'

# Add a vehicle (use token from login)
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"marca":"Toyota","modelo":"Corolla","placa":"ABC-1234"}'

# Get parked vehicles
curl http://localhost:3000/api/vehicles/estacionados \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Considerations

- Change the JWT_SECRET in production
- Use HTTPS in production
- Never commit .env files to version control
- Implement rate limiting for production
- Use strong passwords for database users
- Keep dependencies updated

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Ensure the database exists: `psql -U postgres -l`
- Test connection: `psql -U postgres -d estacionamento`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

## License

ISC
