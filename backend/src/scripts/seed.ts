/**
 * Demo data seeder.
 *
 * Creates the two demo accounts used by the login screen and a small, realistic
 * inventory. Safe to run more than once: existing users and vehicles are kept.
 *
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
import { getDatabase, queryOne } from '../config/database';
import { registerUser } from '../services/authService';
import { createVehicle, getAllVehicles } from '../services/vehicleService';

dotenv.config();

const demoUsers = [
  { email: 'admin@dealership.com', password: 'Admin@123', role: 'admin' as const },
  { email: 'user@dealership.com', password: 'User@123', role: 'user' as const },
];

const demoVehicles = [
  {
    make: 'Tesla', model: 'Model 3', year: 2024, category: 'Electric', price: 42990, quantity: 8,
    color: 'Pearl White', mileage: 0, imageUrl: '/cars/electric.svg',
    description: 'Dual-motor AWD with 358 miles of range, Autopilot, and a minimalist glass cockpit.',
  },
  {
    make: 'Toyota', model: 'Camry XSE', year: 2024, category: 'Sedan', price: 28500, quantity: 12,
    color: 'Midnight Black', mileage: 1200, imageUrl: '/cars/sedan.svg',
    description: 'A dependable mid-size sedan with a refined interior and excellent fuel economy.',
  },
  {
    make: 'Ford', model: 'F-150 Lariat', year: 2023, category: 'Truck', price: 45900, quantity: 5,
    color: 'Antimatter Blue', mileage: 8600, imageUrl: '/cars/truck.svg',
    description: 'Crew-cab pickup with a 3.5L EcoBoost V6, tow package, and 360-degree camera.',
  },
  {
    make: 'Porsche', model: '911 Carrera', year: 2024, category: 'Sports', price: 120000, quantity: 2,
    color: 'Guards Red', mileage: 450, imageUrl: '/cars/sports.svg',
    description: 'Iconic rear-engine sports car with a 379 hp flat-six and razor-sharp handling.',
  },
  {
    make: 'BMW', model: 'X5 xDrive40i', year: 2024, category: 'SUV', price: 68000, quantity: 6,
    color: 'Mineral Silver', mileage: 3100, imageUrl: '/cars/suv.svg',
    description: 'Luxury SUV with adaptive suspension, panoramic roof, and advanced driver assistance.',
  },
  {
    make: 'Mercedes-Benz', model: 'S-Class 580', year: 2024, category: 'Luxury', price: 115000, quantity: 0,
    color: 'Obsidian Black', mileage: 0, imageUrl: '/cars/luxury.svg',
    description: 'Flagship sedan with executive rear seating, Burmester audio, and MBUX Hyperscreen.',
  },
  {
    make: 'Honda', model: 'Civic Sport', year: 2023, category: 'Hatchback', price: 24500, quantity: 9,
    color: 'Sonic Gray', mileage: 5400, imageUrl: '/cars/hatchback.svg',
    description: 'Practical hatchback with a turbocharged engine, spacious cargo area, and Honda Sensing.',
  },
  {
    make: 'Jeep', model: 'Wrangler Rubicon', year: 2023, category: 'SUV', price: 39000, quantity: 3,
    color: 'Sarge Green', mileage: 7200, imageUrl: '/cars/suv.svg',
    description: 'Trail-rated 4x4 with locking differentials, removable roof, and off-road ready tires.',
  },
];

async function seed(): Promise<void> {
  const db = await getDatabase();

  for (const demo of demoUsers) {
    const existing = await queryOne<{ id: string }>(db, 'SELECT id FROM users WHERE email = ?', [demo.email]);
    if (existing) {
      console.log(`↩︎  User already exists: ${demo.email}`);
      continue;
    }
    await registerUser(db, demo);
    console.log(`✅ Created ${demo.role}: ${demo.email} / ${demo.password}`);
  }

  const { total } = await getAllVehicles(db, 1, 1);
  if (total > 0) {
    console.log(`↩︎  Inventory already contains ${total} vehicle(s); skipping demo vehicles.`);
  } else {
    for (const vehicle of demoVehicles) {
      await createVehicle(db, vehicle);
    }
    console.log(`✅ Added ${demoVehicles.length} demo vehicles.`);
  }

  console.log('\nDemo accounts:');
  console.log('  Admin → admin@dealership.com / Admin@123');
  console.log('  User  → user@dealership.com  / User@123');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
