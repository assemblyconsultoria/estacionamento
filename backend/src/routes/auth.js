import express from 'express';
import {
  login,
  register,
  getCurrentUser,
  logout,
  checkUsersExist,
  getAllUsers,
  resetUserPassword,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { loginValidation, registerValidation } from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/check-users', checkUsersExist);

// Protected routes
router.get('/user', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, resetUserPassword);

export default router;
