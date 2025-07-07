import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { 
  getRestaurantOwnerProfile, 
  updateRestaurantOwnerProfile, 
  updateRestaurantOwnerProfilePhoto, 
  changeRestaurantOwnerPassword 
} from '../controllers/restaurantOwnerController.js';
import { uploadProfilePhoto } from '../middleware/upload/index.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

// Profile management routes
router.get('/profile', getRestaurantOwnerProfile);
router.put('/profile', updateRestaurantOwnerProfile);
router.put('/profile/photo', uploadProfilePhoto, updateRestaurantOwnerProfilePhoto);
router.put('/password', changeRestaurantOwnerPassword);

export default router; 