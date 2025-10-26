import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Estacionamento API - Sistema de Gerenciamento de Estacionamento',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        user: 'GET /api/auth/user',
        logout: 'POST /api/auth/logout'
      },
      vehicles: {
        list: 'GET /api/vehicles',
        parked: 'GET /api/vehicles/estacionados',
        stats: 'GET /api/vehicles/stats',
        getById: 'GET /api/vehicles/:id',
        add: 'POST /api/vehicles',
        update: 'PUT /api/vehicles/:id',
        delete: 'DELETE /api/vehicles/:id',
        calculateValue: 'GET /api/vehicles/:id/calcular-valor',
        checkout: 'PUT /api/vehicles/:id/checkout'
      }
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connected = await testConnection();

    if (!connected) {
      console.error('Failed to connect to database. Please check your configuration.');
      console.error('Database details:');
      console.error(`  Host: ${process.env.DB_HOST}`);
      console.error(`  Port: ${process.env.DB_PORT}`);
      console.error(`  Database: ${process.env.DB_NAME}`);
      console.error(`  User: ${process.env.DB_USER}`);
      process.exit(1);
    }

    console.log('Database connection successful!');

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log(`  Estacionamento API Server`);
      console.log('='.repeat(60));
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  API documentation: http://localhost:${PORT}/api`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
