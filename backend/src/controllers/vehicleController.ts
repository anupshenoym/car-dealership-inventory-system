import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDatabase } from '../config/database';
import {
  createVehicle, getAllVehicles, getVehicleById,
  searchVehicles, updateVehicle, deleteVehicle,
  purchaseVehicle, restockVehicle,
} from '../services/vehicleService';

/**
 * POST /api/vehicles
 */
export async function addVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const vehicle = createVehicle(db, req.body);
    res.status(201).json({ message: 'Vehicle added successfully.', vehicle });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to add vehicle.' });
  }
}

/**
 * GET /api/vehicles
 */
export async function listVehicles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const result = getAllVehicles(db, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicles.' });
  }
}

/**
 * GET /api/vehicles/search
 */
export async function findVehicles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const result = searchVehicles(db, req.query as any);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Search failed.' });
  }
}

/**
 * GET /api/vehicles/:id
 */
export async function getVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const vehicle = getVehicleById(db, req.params.id);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found.' });
      return;
    }
    res.status(200).json({ vehicle });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicle.' });
  }
}

/**
 * PUT /api/vehicles/:id
 */
export async function editVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const vehicle = updateVehicle(db, req.params.id, req.body);
    res.status(200).json({ message: 'Vehicle updated successfully.', vehicle });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Update failed.';
    const status = msg.includes('not found') ? 404 : 400;
    res.status(status).json({ message: msg });
  }
}

/**
 * DELETE /api/vehicles/:id
 */
export async function removeVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    deleteVehicle(db, req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Delete failed.';
    const status = msg.includes('not found') ? 404 : 400;
    res.status(status).json({ message: msg });
  }
}

/**
 * POST /api/vehicles/:id/purchase
 */
export async function buyVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const vehicle = purchaseVehicle(db, req.params.id);
    res.status(200).json({ message: 'Purchase successful.', vehicle });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Purchase failed.';
    const status = msg.includes('not found') ? 404 : msg.includes('out of stock') ? 409 : 400;
    res.status(status).json({ message: msg });
  }
}

/**
 * POST /api/vehicles/:id/restock
 */
export async function addStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDatabase();
    const amount = parseInt(req.body.amount, 10);
    const vehicle = restockVehicle(db, req.params.id, amount);
    res.status(200).json({ message: 'Restock successful.', vehicle });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Restock failed.';
    const status = msg.includes('not found') ? 404 : 400;
    res.status(status).json({ message: msg });
  }
}
