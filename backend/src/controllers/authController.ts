import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { registerUser, loginUser } from '../services/authService';

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const result = await registerUser(db, req.body);
    res.status(201).json({ message: 'Registration successful.', ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Registration failed.';
    const status = msg.includes('already registered') ? 409 : 400;
    res.status(status).json({ message: msg });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const result = await loginUser(db, req.body);
    res.status(200).json({ message: 'Login successful.', ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Login failed.';
    res.status(401).json({ message: msg });
  }
}
