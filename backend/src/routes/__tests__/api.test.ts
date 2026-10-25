/**
 * TDD: API Integration Tests
 * Tests the full HTTP request/response cycle for auth and vehicle endpoints.
 */
import request from 'supertest';
import app from '../../app';
import { getTestDatabase, closeDatabase } from '../../config/database';
import { Database } from 'sql.js';

// We override the database module to use an in-memory test DB for integration tests
jest.mock('../../config/database', () => {
  const actual = jest.requireActual('../../config/database');
  let testDb: Database | null = null;

  return {
    ...actual,
    getDatabase: async () => {
      if (!testDb) {
        testDb = await actual.getTestDatabase();
      }
      return testDb;
    },
    persistDatabase: () => {}, // no-op for tests
  };
});

let adminToken: string;
let userToken: string;
let vehicleId: string;

beforeAll(async () => {
  // Register admin
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@dealership.com', password: 'Admin@123', role: 'admin' });
  adminToken = adminRes.body.token;

  // Register regular user
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@dealership.com', password: 'User@123' });
  userToken = userRes.body.token;
});

// ─────────────────────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register successfully and return 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@test.com');
  });

  it('should return 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'pass123' });
    const res = await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'other123' });

    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-valid', password: 'pass123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login and return 200 with token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dealership.com', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should return 401 for wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dealership.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// VEHICLE ENDPOINTS
// ─────────────────────────────────────────────
describe('POST /api/vehicles', () => {
  it('should add a vehicle when authenticated', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Tesla', model: 'Model S', year: 2024, category: 'Electric', price: 90000, quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.vehicle.make).toBe('Tesla');
    vehicleId = res.body.vehicle.id;
  });

  it('should return 401 without a token', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({ make: 'Ford', model: 'F-150', year: 2023, category: 'Truck', price: 45000, quantity: 10 });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Ford' }); // missing model, year, etc.

    expect(res.status).toBe(400);
  });
});

describe('GET /api/vehicles', () => {
  it('should return vehicle list for authenticated users', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.vehicles)).toBe(true);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/vehicles/search', () => {
  it('should search by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Tesla')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicles.some((v: any) => v.make === 'Tesla')).toBe(true);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('should update a vehicle', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 95000 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.price).toBe(95000);
  });

  it('should return 404 for unknown vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1000 });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('should purchase and decrement quantity', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(4);
  });
});

describe('POST /api/vehicles/:id/restock (Admin only)', () => {
  it('should allow admin to restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(14);
  });

  it('should return 403 when non-admin tries to restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 10 });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/vehicles/:id (Admin only)', () => {
  it('should return 403 when non-admin tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to delete', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
