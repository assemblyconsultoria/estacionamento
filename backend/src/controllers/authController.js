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
      username: user.username,
      isAdmin: user.is_admin
    });

    // Return user info and token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
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

    // Check if this is the first user
    const userCount = await User.count();
    const isFirstUser = userCount === 0;

    // Create new user (first user is automatically admin)
    const newUser = await User.create(username, password, isFirstUser);

    // Generate token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      isAdmin: newUser.is_admin
    });

    res.status(201).json({
      success: true,
      message: isFirstUser ? 'Primeiro usuário criado com permissões de admin' : 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.is_admin
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
        isAdmin: user.is_admin,
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

// Check if any users exist (for first-time setup)
export const checkUsersExist = async (req, res, next) => {
  try {
    const userCount = await User.count();

    res.json({
      success: true,
      usersExist: userCount > 0,
      count: userCount
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Prevent admin from resetting their own password this way
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Não é possível resetar sua própria senha por esta rota',
        message: 'Cannot reset your own password through this route'
      });
    }

    const user = await User.resetPassword(id, newPassword);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    // Check if username is already taken by another user
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== id) {
      return res.status(409).json({
        error: 'Nome de usuário já está em uso',
        message: 'Username already taken'
      });
    }

    const user = await User.update(id, username);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Não é possível deletar sua própria conta',
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.delete(id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
