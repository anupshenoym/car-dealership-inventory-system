/**
 * TDD: Auth Service Tests
 * Red-Green-Refactor cycle:
 * RED   - write failing tests first
 * GREEN - implement minimum code to pass
 * REFACTOR - clean up keeping tests green
 */
import { getTestDatabase } from '../../config/database';
import { registerUser, loginUser } from '../authService';
import { Client } from '@libsql/client';

let db: Client;

beforeEach(async () => {
  db = await getTestDatabase();
});

afterEach(() => {
  db.close();
});

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
describe('authService.registerUser', () => {
  it('should register a new user and return token + user data', async () => {
    const result = await registerUser(db, { email: 'alice@example.com', password: 'secret123' });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.role).toBe('user');
    expect(result.user.id).toBeDefined();
    expect((result.user as any).password).toBeUndefined();
  });

  it('should register a user with admin role when specified', async () => {
    const result = await registerUser(db, { email: 'admin@example.com', password: 'admin123', role: 'admin' });

    expect(result.user.role).toBe('admin');
  });

  it('should throw if email is already taken', async () => {
    await registerUser(db, { email: 'duplicate@example.com', password: 'pass123' });

    await expect(
      registerUser(db, { email: 'duplicate@example.com', password: 'other123' })
    ).rejects.toThrow('Email is already registered.');
  });

  it('should throw if email is missing', async () => {
    await expect(
      registerUser(db, { email: '', password: 'pass123' })
    ).rejects.toThrow('Email and password are required.');
  });

  it('should throw if password is too short', async () => {
    await expect(
      registerUser(db, { email: 'user@example.com', password: '123' })
    ).rejects.toThrow('Password must be at least 6 characters.');
  });

  it('should throw if email format is invalid', async () => {
    await expect(
      registerUser(db, { email: 'not-an-email', password: 'pass123' })
    ).rejects.toThrow('Invalid email format.');
  });

  it('should hash the password (not store plain text)', async () => {
    await registerUser(db, { email: 'secure@example.com', password: 'mypassword' });

    // Read raw from DB to verify hashing
    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE email = ?',
      args: ['secure@example.com'],
    });
    const stored = result.rows[0]?.password as string;

    expect(stored).not.toBe('mypassword');
    expect(stored).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
  });
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
describe('authService.loginUser', () => {
  beforeEach(async () => {
    await registerUser(db, { email: 'bob@example.com', password: 'password123' });
  });

  it('should return a token and user data for valid credentials', async () => {
    const result = await loginUser(db, { email: 'bob@example.com', password: 'password123' });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('bob@example.com');
    expect((result.user as any).password).toBeUndefined();
  });

  it('should throw for wrong password', async () => {
    await expect(
      loginUser(db, { email: 'bob@example.com', password: 'wrongpassword' })
    ).rejects.toThrow('Invalid email or password.');
  });

  it('should throw for non-existent email', async () => {
    await expect(
      loginUser(db, { email: 'ghost@example.com', password: 'password123' })
    ).rejects.toThrow('Invalid email or password.');
  });

  it('should throw if email or password is missing', async () => {
    await expect(
      loginUser(db, { email: '', password: 'password123' })
    ).rejects.toThrow('Email and password are required.');
  });
});
