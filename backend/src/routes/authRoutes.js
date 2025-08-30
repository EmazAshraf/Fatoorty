import express from 'express';
import { authenticate } from '../middleware/auth/index.js';
import { getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

/**
 * General Authentication Routes
 * Handles shared authentication operations
 */

// Protected route - requires authentication
router.get('auth/me', authenticate, getCurrentUser);

export default router;



