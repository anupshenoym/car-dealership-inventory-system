/**
 * TDD: Vehicle Service Tests
 * Covers full CRUD, search, purchase, and restock logic.
 */
import { getTestDatabase } from '../../config/database';
import {
  createVehicle, getAllVehicles, getVehicleById,
  searchVehicles, updateVehicle, deleteVehicle,
  purchaseVehicle, restockVehicle,
} from '../vehicleService';
import { Database } from 'sql.js';

let db: Database;

const sampleVehicle = {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  category: 'Sedan',
  price: 28000,
  quantity: 5,
  color: 'Silver',
};

beforeEach(async () => {
  db = await getTestDatabase();
});

afterEach(() => {
  db.close();
});

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
describe('vehicleService.createVehicle', () => {
  it('should create and return a vehicle with a generated ID', () => {
    const vehicle = createVehicle(db, sampleVehicle);

    expect(vehicle.id).toBeDefined();
    expect(vehicle.make).toBe('Toyota');
    expect(vehicle.model).toBe('Camry');
    expect(vehicle.year).toBe(2023);
    expect(vehicle.price).toBe(28000);
    expect(vehicle.quantity).toBe(5);
  });

  it('should throw if required fields are missing', () => {
    expect(() => createVehicle(db, { make: '', model: 'Camry', year: 2023, category: 'Sedan', price: 28000, quantity: 5 }))
      .toThrow('make, model, year, category, price, and quantity are required.');
  });

  it('should throw if price is negative', () => {
    expect(() => createVehicle(db, { ...sampleVehicle, price: -100 }))
      .toThrow('Price cannot be negative.');
  });

  it('should throw if quantity is negative', () => {
    expect(() => createVehicle(db, { ...sampleVehicle, quantity: -1 }))
      .toThrow('Quantity cannot be negative.');
  });

  it('should throw for invalid year', () => {
    expect(() => createVehicle(db, { ...sampleVehicle, year: 1800 }))
      .toThrow('Invalid vehicle year.');
  });

  it('should persist optional fields', () => {
    const vehicle = createVehicle(db, { ...sampleVehicle, description: 'Great car', mileage: 15000 });
    expect(vehicle.description).toBe('Great car');
    expect(vehicle.mileage).toBe(15000);
  });
});

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────
describe('vehicleService.getAllVehicles', () => {
  it('should return an empty list when no vehicles exist', () => {
    const result = getAllVehicles(db);
    expect(result.vehicles).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should return all vehicles with pagination metadata', () => {
    createVehicle(db, sampleVehicle);
    createVehicle(db, { ...sampleVehicle, make: 'Honda', model: 'Civic' });

    const result = getAllVehicles(db, 1, 10);
    expect(result.vehicles).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});

describe('vehicleService.getVehicleById', () => {
  it('should return a vehicle by ID', () => {
    const created = createVehicle(db, sampleVehicle);
    const found = getVehicleById(db, created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined for unknown ID', () => {
    expect(getVehicleById(db, 'non-existent-id')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────
describe('vehicleService.searchVehicles', () => {
  beforeEach(() => {
    createVehicle(db, { make: 'Toyota', model: 'Camry', year: 2023, category: 'Sedan', price: 28000, quantity: 5 });
    createVehicle(db, { make: 'Toyota', model: 'RAV4', year: 2022, category: 'SUV', price: 35000, quantity: 3 });
    createVehicle(db, { make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 24000, quantity: 10 });
    createVehicle(db, { make: 'BMW', model: 'M3', year: 2023, category: 'Sports', price: 75000, quantity: 2 });
  });

  it('should filter by make', () => {
    const result = searchVehicles(db, { make: 'Toyota' });
    expect(result.vehicles).toHaveLength(2);
    expect(result.vehicles.every(v => v.make === 'Toyota')).toBe(true);
  });

  it('should filter by model', () => {
    const result = searchVehicles(db, { model: 'Civic' });
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].model).toBe('Civic');
  });

  it('should filter by category', () => {
    const result = searchVehicles(db, { category: 'Sedan' });
    expect(result.vehicles).toHaveLength(2);
  });

  it('should filter by price range', () => {
    const result = searchVehicles(db, { minPrice: '25000', maxPrice: '40000' });
    expect(result.vehicles).toHaveLength(2); // Camry + RAV4
    result.vehicles.forEach(v => {
      expect(v.price).toBeGreaterThanOrEqual(25000);
      expect(v.price).toBeLessThanOrEqual(40000);
    });
  });

  it('should return case-insensitive results', () => {
    const result = searchVehicles(db, { make: 'toyota' });
    expect(result.vehicles).toHaveLength(2);
  });

  it('should return all vehicles with no filters', () => {
    const result = searchVehicles(db, {});
    expect(result.total).toBe(4);
  });
});

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
describe('vehicleService.updateVehicle', () => {
  it('should update specified fields', () => {
    const vehicle = createVehicle(db, sampleVehicle);
    const updated = updateVehicle(db, vehicle.id, { price: 30000, color: 'Blue' });

    expect(updated.price).toBe(30000);
    expect(updated.color).toBe('Blue');
    expect(updated.make).toBe('Toyota'); // unchanged
  });

  it('should throw if vehicle does not exist', () => {
    expect(() => updateVehicle(db, 'no-such-id', { price: 1000 }))
      .toThrow('Vehicle not found.');
  });

  it('should reject negative price on update', () => {
    const vehicle = createVehicle(db, sampleVehicle);
    expect(() => updateVehicle(db, vehicle.id, { price: -500 }))
      .toThrow('Price cannot be negative.');
  });
});

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
describe('vehicleService.deleteVehicle', () => {
  it('should delete a vehicle', () => {
    const vehicle = createVehicle(db, sampleVehicle);
    deleteVehicle(db, vehicle.id);
    expect(getVehicleById(db, vehicle.id)).toBeUndefined();
  });

  it('should throw when deleting a non-existent vehicle', () => {
    expect(() => deleteVehicle(db, 'fake-id')).toThrow('Vehicle not found.');
  });
});

// ─────────────────────────────────────────────
// PURCHASE
// ─────────────────────────────────────────────
describe('vehicleService.purchaseVehicle', () => {
  it('should decrement quantity by 1', () => {
    const vehicle = createVehicle(db, { ...sampleVehicle, quantity: 3 });
    const updated = purchaseVehicle(db, vehicle.id);
    expect(updated.quantity).toBe(2);
  });

  it('should throw when out of stock', () => {
    const vehicle = createVehicle(db, { ...sampleVehicle, quantity: 0 });
    expect(() => purchaseVehicle(db, vehicle.id)).toThrow('Vehicle is out of stock.');
  });

  it('should throw for unknown vehicle', () => {
    expect(() => purchaseVehicle(db, 'bad-id')).toThrow('Vehicle not found.');
  });
});

// ─────────────────────────────────────────────
// RESTOCK
// ─────────────────────────────────────────────
describe('vehicleService.restockVehicle', () => {
  it('should increment quantity by given amount', () => {
    const vehicle = createVehicle(db, { ...sampleVehicle, quantity: 2 });
    const updated = restockVehicle(db, vehicle.id, 10);
    expect(updated.quantity).toBe(12);
  });

  it('should throw for zero or negative amount', () => {
    const vehicle = createVehicle(db, sampleVehicle);
    expect(() => restockVehicle(db, vehicle.id, 0)).toThrow('Restock amount must be a positive number.');
    expect(() => restockVehicle(db, vehicle.id, -5)).toThrow('Restock amount must be a positive number.');
  });

  it('should throw for unknown vehicle', () => {
    expect(() => restockVehicle(db, 'fake-id', 5)).toThrow('Vehicle not found.');
  });
});
