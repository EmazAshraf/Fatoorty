import express from 'express';
import { authenticate, requireSuperadmin } from '../middleware/auth/index.js';
import { uploadProfilePhoto } from '../middleware/upload/index.js';
import { validateAuth } from '../middleware/validation.js';
import { validateVerificationStatus, validateVerificationQuery, validateRestaurantId } from '../middleware/validation/verificationValidation.js';

// Import all superadmin controllers
import { 
  // Auth controllers
  login, 
  logout, 
  refreshToken,
  // Profile controllers
  getAllSuperadmins, 
  createSuperadmin, 
  updateSuperadmin, 
  getProfile, 
  updateProfile, 
  updateProfilePhoto, 
  changePassword,
  // Verification controllers
  getVerifications,
  updateStatus,
  bulkUpdateStatus,
  getStats,
  getRestaurantDetails
} from '../controllers/superadminController.js';



const router = express.Router();

/**
 * Superadmin Routes
 * Unified API structure for all superadmin operations
 */

// Authentication routes (no auth required)
router.post('/auth/login', validateAuth, login);
router.post('/auth/logout', logout);
router.post('/auth/refresh', refreshToken);

// Protected routes (require superadmin authentication)
router.use(authenticate, requireSuperadmin);

// Dashboard routes
router.get('/dashboard/stats', (req, res) => {
  res.json({ stats: { totalRestaurants: 0, totalOrders: 0, totalRevenue: 0 } });
});

router.get('/dashboard/recent-orders', (req, res) => {
  res.json({ orders: [] });
});

router.get('/dashboard/top-restaurants', (req, res) => {
  res.json({ restaurants: [] });
});

// Superadmin management routes
router.get('/', getAllSuperadmins);
router.post('/', createSuperadmin);
router.put('/profile', updateSuperadmin);

// Profile and settings routes
router.get('/profile', getProfile);
router.put('/settings/profile', updateProfile);
router.post('/settings/profile-photo', uploadProfilePhoto, updateProfilePhoto);
router.put('/settings/password', changePassword);

// Verification routes
router.get('/verification', validateVerificationQuery, getVerifications);
router.get('/verification/stats', getStats);
router.get('/verification/:restaurantId/details', validateRestaurantId, getRestaurantDetails);
router.patch('/verification/:restaurantId', validateRestaurantId, validateVerificationStatus, updateStatus);
router.patch('/verification/bulk', validateVerificationStatus, bulkUpdateStatus);

export default router; 