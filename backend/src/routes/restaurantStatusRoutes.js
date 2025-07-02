import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { getStatus } from '../controllers/restaurantStatusController.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

router.get('/status', getStatus);

export default router; 