import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@libsql/client';
import { User, RegisterBody, LoginBody, AuthPayload } from '../types';
import { queryOne, execute } from '../config/database';
import { generateToken } from '../middleware/auth';

const SALT_ROUNDS = 10;

/**
 * Register a new user with hashed password.
 * Throws if the email is already taken.
 */
export async function registerUser(
  db: Client,
  body: RegisterBody
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const { email, password, role = 'user' } = body;

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Check uniqueness
  const existing = await queryOne<User>(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    throw new Error('Email is already registered.');
  }

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const createdAt = new Date().toISOString();

  await execute(db, 'INSERT INTO users (id, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)', [
    id, email, hashedPassword, role, createdAt,
  ]);

  const payload: AuthPayload = { userId: id, email, role };
  const token = generateToken(payload);

  return {
    user: { id, email, role, createdAt },
    token,
  };
}

/**
 * Authenticate a user with email and password.
 * Throws if credentials are invalid.
 */
export async function loginUser(
  db: Client,
  body: LoginBody
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const { email, password } = body;

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = await queryOne<User>(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password.');
  }

  const payload: AuthPayload = { userId: user.id, email: user.email, role: user.role };
  const token = generateToken(payload);

  return {
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    token,
  };
}
