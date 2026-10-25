import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'dealership.db');

let dbInstance: Database | null = null;
let sqlJs: Awaited<ReturnType<typeof initSqlJs>> | null = null;

/**
 * Initialize sql.js and return the module.
 * Caches the wasm module after first load for performance.
 */
async function getSqlJs() {
  if (!sqlJs) {
    sqlJs = await initSqlJs();
  }
  return sqlJs;
}

/**
 * Get (or create) the production SQLite database.
 * Loads from disk if file exists, otherwise creates fresh.
 */
export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await getSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  initializeSchema(dbInstance);
  return dbInstance;
}

/**
 * Persist the in-memory database to disk.
 * Call this after any write operation.
 */
export function persistDatabase(db: Database): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Create a fresh in-memory database for testing.
 * Does not touch the production database file.
 */
export async function getTestDatabase(): Promise<Database> {
  const SQL = await getSqlJs();
  const testDb = new SQL.Database();
  initializeSchema(testDb);
  return testDb;
}

/**
 * Create the users and vehicles tables if they do not exist.
 */
function initializeSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      createdAt TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
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
    )
  `);
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
 * Execute a query that returns rows and map results to objects.
 */
export function queryAll<T>(db: Database, sql: string, params: (string | number | null)[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

/**
 * Execute a query that returns a single row.
 */
export function queryOne<T>(db: Database, sql: string, params: (string | number | null)[] = []): T | undefined {
  const results = queryAll<T>(db, sql, params);
  return results[0];
}

/**
 * Execute an INSERT / UPDATE / DELETE statement.
 */
export function execute(db: Database, sql: string, params: (string | number | null)[] = []): void {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
}
