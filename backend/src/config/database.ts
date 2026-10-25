import { createClient, Client, InValue } from '@libsql/client';
import path from 'path';
import fs from 'fs';

/**
 * Database configuration.
 *
 * - Local development / tests: a real SQLite file (or `:memory:` for tests)
 *   through libSQL's embedded client.
 * - Production: Turso, configured with TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 *
 * Both modes share the same async client API, so services do not care which
 * storage backend is active.
 */
const DB_DIR = process.env.DB_DIR || path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'dealership.db');

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  // libSQL expects forward slashes in file: URLs on every platform.
  return `file:${DB_PATH.replace(/\\/g, '/')}`;
}

let dbInstance: Client | null = null;

/**
 * Get (or create) the application database and ensure the schema exists.
 */
export async function getDatabase(): Promise<Client> {
  if (dbInstance) return dbInstance;

  dbInstance = createClient({
    url: resolveDatabaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await initializeSchema(dbInstance);
  return dbInstance;
}

/**
 * Create a fresh in-memory database for testing.
 * Does not touch the production database.
 */
export async function getTestDatabase(): Promise<Client> {
  const testDb = createClient({ url: ':memory:' });
  await initializeSchema(testDb);
  return testDb;
}

/**
 * Create the users and vehicles tables if they do not exist.
 */
export async function initializeSchema(db: Client): Promise<void> {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        createdAt TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        color TEXT,
        mileage INTEGER,
        description TEXT,
        imageUrl TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`,
    ],
    'write'
  );
}

/**
 * Close and reset the singleton database instance.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Execute a query that returns rows and map results to plain objects.
 */
export async function queryAll<T>(
  db: Client,
  sql: string,
  params: InValue[] = []
): Promise<T[]> {
  const result = await db.execute({ sql, args: params });
  return result.rows.map((row) => {
    const record: Record<string, unknown> = {};
    result.columns.forEach((column, index) => {
      record[column] = row[index];
    });
    return record as T;
  });
}

/**
 * Execute a query that returns a single row.
 */
export async function queryOne<T>(
  db: Client,
  sql: string,
  params: InValue[] = []
): Promise<T | undefined> {
  const results = await queryAll<T>(db, sql, params);
  return results[0];
}

/**
 * Execute an INSERT / UPDATE / DELETE statement.
 */
export async function execute(
  db: Client,
  sql: string,
  params: InValue[] = []
): Promise<void> {
  await db.execute({ sql, args: params });
}
