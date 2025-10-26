import express from 'express';
import {
  getAllVehicles,
  getEstacionados,
  getVehicleById,
  addVehicle,
  calcularValor,
  checkoutVehicle,
  updateVehicle,
  deleteVehicle,
  getStats
} from '../controllers/vehicleController.js';
import { authenticateToken } from '../middleware/auth.js';
import { vehicleValidation, uuidValidation } from '../middleware/validator.js';

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// Statistics route
router.get('/stats', getStats);

// Get parked vehicles
router.get('/estacionados', getEstacionados);

// CRUD routes
router.get('/', getAllVehicles);
router.get('/:id', uuidValidation, getVehicleById);
router.post('/', vehicleValidation, addVehicle);
router.put('/:id', uuidValidation, vehicleValidation, updateVehicle);
router.delete('/:id', uuidValidation, deleteVehicle);

// Parking operations
router.get('/:id/calcular-valor', uuidValidation, calcularValor);
router.put('/:id/checkout', uuidValidation, checkoutVehicle);

export default router;
