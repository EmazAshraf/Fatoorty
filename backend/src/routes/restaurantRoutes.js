import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { getRestaurantProfile, updateRestaurantProfileController } from '../controllers/restaurantController.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

router.get('/profile', getRestaurantProfile);
router.put('/profile', updateRestaurantProfileController);

export default router; 