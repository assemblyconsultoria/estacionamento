import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class User {
  // Create a new user
  static async create(username, password) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      'SELECT id, username, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (for admin purposes, returns without password)
  static async findAll() {
    const result = await query(
      'SELECT id, username, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
  }

  // Update user
  static async update(id, username) {
    const result = await query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, updated_at',
      [username, id]
    );

    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }
}
