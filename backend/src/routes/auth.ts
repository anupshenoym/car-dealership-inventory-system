import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate and receive JWT
 * @access Public
 */
router.post('/login', login);

export default router;
