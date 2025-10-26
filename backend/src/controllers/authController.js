import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// Login user
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username
    });

    // Return user info and token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByUsername(username);

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuário já existe',
        message: 'Username already taken'
      });
    }

    // Create new user
    const newUser = await User.create(username, password);

    // Generate token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user info
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout (client-side only, just for consistency)
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};
