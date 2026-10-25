import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';

dotenv.config();

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
// Support one or more comma-separated frontend origins (local + deployed).
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header) and known frontends.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Car Dealership API is running.' });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

export default app;
