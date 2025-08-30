import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { uploadProfilePhoto, uploadRestaurantSignup } from '../middleware/upload/index.js';

import { 
  validateAuth, 
  validateRestaurantSignup, 
  validateProfileUpdate, 
  validatePasswordChange 
} from '../middleware/validation.js';
import { 
  signup, 
  login, 
  logout,
  refreshToken,
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/restaurantController.js';

const router = express.Router();

/**
 * Restaurant Routes
 * Unified API structure for all restaurant operations
 */

// Authentication routes (no auth required)
router.post('/auth/signup', validateRestaurantSignup, uploadRestaurantSignup, signup);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/refresh', refreshToken);

// Protected routes (require authentication)
router.use(authenticate, requireRestaurantOwner);

// Profile management routes
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, uploadProfilePhoto, updateProfile);
router.put('/password', validatePasswordChange, changePassword);

export default router; 