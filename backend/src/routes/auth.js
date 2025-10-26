import express from 'express';
import {
  login,
  register,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginValidation, registerValidation } from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Protected routes
router.get('/user', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

export default router;
