import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  addVehicle, listVehicles, findVehicles, getVehicle,
  editVehicle, removeVehicle, buyVehicle, addStock,
} from '../controllers/vehicleController';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/vehicles
 * @desc   List all vehicles (paginated)
 * @access Protected
 */
router.get('/', listVehicles);

/**
 * @route  GET /api/vehicles/search
 * @desc   Search vehicles by make, model, category, price range
 * @access Protected
 */
router.get('/search', findVehicles);

/**
 * @route  GET /api/vehicles/:id
 * @desc   Get a single vehicle by ID
 * @access Protected
 */
router.get('/:id', getVehicle);

/**
 * @route  POST /api/vehicles
 * @desc   Add a new vehicle
 * @access Protected (Admin recommended, any authenticated user can add)
 */
router.post('/', addVehicle);

/**
 * @route  PUT /api/vehicles/:id
 * @desc   Update vehicle details
 * @access Protected
 */
router.put('/:id', editVehicle);

/**
 * @route  DELETE /api/vehicles/:id
 * @desc   Delete a vehicle (Admin only)
 * @access Admin
 */
router.delete('/:id', requireAdmin, removeVehicle);

/**
 * @route  POST /api/vehicles/:id/purchase
 * @desc   Purchase a vehicle, decrement stock
 * @access Protected
 */
router.post('/:id/purchase', buyVehicle);

/**
 * @route  POST /api/vehicles/:id/restock
 * @desc   Restock a vehicle (Admin only)
 * @access Admin
 */
router.post('/:id/restock', requireAdmin, addStock);

export default router;
