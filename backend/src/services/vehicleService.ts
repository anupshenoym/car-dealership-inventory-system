import { v4 as uuidv4 } from 'uuid';
import { Client } from '@libsql/client';
import { Vehicle, CreateVehicleBody, UpdateVehicleBody, SearchQuery } from '../types';
import { queryAll, queryOne, execute } from '../config/database';

/**
 * Create a new vehicle listing.
 */
export async function createVehicle(db: Client, body: CreateVehicleBody): Promise<Vehicle> {
  const { make, model, year, category, price, quantity, color, mileage, description, imageUrl } = body;

  if (!make || !model || !year || !category || price === undefined || quantity === undefined) {
    throw new Error('make, model, year, category, price, and quantity are required.');
  }
  if (price < 0) throw new Error('Price cannot be negative.');
  if (quantity < 0) throw new Error('Quantity cannot be negative.');
  if (year < 1886 || year > new Date().getFullYear() + 2) {
    throw new Error('Invalid vehicle year.');
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await execute(db,
    `INSERT INTO vehicles (id, make, model, year, category, price, quantity, color, mileage, description, imageUrl, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, make, model, year, category, price, quantity, color ?? null, mileage ?? null, description ?? null, imageUrl ?? null, now, now]
  );

  return (await getVehicleById(db, id)) as Vehicle;
}

/**
 * Get all vehicles with optional pagination.
 */
export async function getAllVehicles(db: Client, page = 1, limit = 20): Promise<{ vehicles: Vehicle[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;
  const vehicles = await queryAll<Vehicle>(db, 'SELECT * FROM vehicles ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
  const countResult = await queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM vehicles', []);
  const total = countResult?.count ?? 0;
  return { vehicles, total, page, limit };
}

/**
 * Get a single vehicle by ID.
 */
export async function getVehicleById(db: Client, id: string): Promise<Vehicle | undefined> {
  return queryOne<Vehicle>(db, 'SELECT * FROM vehicles WHERE id = ?', [id]);
}

/**
 * Search vehicles by make, model, category, or price range.
 */
export async function searchVehicles(db: Client, query: SearchQuery): Promise<{ vehicles: Vehicle[]; total: number }> {
  const { make, model, category, minPrice, maxPrice, page = '1', limit = '20' } = query;

  const conditions: string[] = [];
  const params: (string | number | null)[] = [];

  if (make) { conditions.push('LOWER(make) LIKE ?'); params.push(`%${make.toLowerCase()}%`); }
  if (model) { conditions.push('LOWER(model) LIKE ?'); params.push(`%${model.toLowerCase()}%`); }
  if (category) { conditions.push('LOWER(category) LIKE ?'); params.push(`%${category.toLowerCase()}%`); }
  if (minPrice) { conditions.push('price >= ?'); params.push(parseFloat(minPrice)); }
  if (maxPrice) { conditions.push('price <= ?'); params.push(parseFloat(maxPrice)); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const countResult = await queryOne<{ count: number }>(db, `SELECT COUNT(*) as count FROM vehicles ${where}`, params);
  const total = countResult?.count ?? 0;
  const vehicles = await queryAll<Vehicle>(db, `SELECT * FROM vehicles ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, limitNum, offset]);

  return { vehicles, total };
}

/**
 * Update a vehicle's details by ID.
 * Only updates provided fields.
 */
export async function updateVehicle(db: Client, id: string, body: UpdateVehicleBody): Promise<Vehicle> {
  const existing = await getVehicleById(db, id);
  if (!existing) throw new Error('Vehicle not found.');

  if (body.price !== undefined && body.price < 0) throw new Error('Price cannot be negative.');
  if (body.quantity !== undefined && body.quantity < 0) throw new Error('Quantity cannot be negative.');

  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };

  await execute(db,
    `UPDATE vehicles SET make=?, model=?, year=?, category=?, price=?, quantity=?, color=?, mileage=?, description=?, imageUrl=?, updatedAt=?
     WHERE id=?`,
    [updated.make, updated.model, updated.year, updated.category, updated.price, updated.quantity,
     updated.color ?? null, updated.mileage ?? null, updated.description ?? null, updated.imageUrl ?? null,
     updated.updatedAt, id]
  );

  return (await getVehicleById(db, id)) as Vehicle;
}

/**
 * Delete a vehicle by ID.
 */
export async function deleteVehicle(db: Client, id: string): Promise<void> {
  const existing = await getVehicleById(db, id);
  if (!existing) throw new Error('Vehicle not found.');
  await execute(db, 'DELETE FROM vehicles WHERE id = ?', [id]);
}

/**
 * Purchase a vehicle — decrements quantity by 1.
 * Throws if out of stock.
 */
export async function purchaseVehicle(db: Client, id: string): Promise<Vehicle> {
  const vehicle = await getVehicleById(db, id);
  if (!vehicle) throw new Error('Vehicle not found.');
  if (vehicle.quantity <= 0) throw new Error('Vehicle is out of stock.');

  await execute(db, 'UPDATE vehicles SET quantity = quantity - 1, updatedAt = ? WHERE id = ?', [new Date().toISOString(), id]);

  return (await getVehicleById(db, id)) as Vehicle;
}

/**
 * Restock a vehicle — increments quantity by given amount.
 */
export async function restockVehicle(db: Client, id: string, amount: number): Promise<Vehicle> {
  if (!amount || amount <= 0) throw new Error('Restock amount must be a positive number.');
  const vehicle = await getVehicleById(db, id);
  if (!vehicle) throw new Error('Vehicle not found.');

  await execute(db, 'UPDATE vehicles SET quantity = quantity + ?, updatedAt = ? WHERE id = ?', [amount, new Date().toISOString(), id]);

  return (await getVehicleById(db, id)) as Vehicle;
}
