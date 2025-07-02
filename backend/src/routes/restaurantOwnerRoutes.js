import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { getProfile, updateProfile } from '../controllers/restaurantOwnerController.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router; 