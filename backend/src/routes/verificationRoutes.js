import express from 'express';
import { authenticate, requireSuperadmin } from '../middleware/auth/index.js';
import { 
  getVerifications,
  updateStatus,
  bulkUpdateStatus,
  getStats,
  getRestaurantDetails
} from '../controllers/verificationController.js';
import { validateVerificationStatus, validateVerificationQuery, validateRestaurantId } from '../middleware/validation/verificationValidation.js';

const router = express.Router();

// Apply authentication and superadmin authorization to all routes
router.use(authenticate, requireSuperadmin);

/**
 * @route   GET /api/superadmin/verification
 * @desc    Get paginated restaurant verifications with filters
 * @access  Superadmin only
 */
router.get('/', validateVerificationQuery, getVerifications);

/**
 * @route   GET /api/superadmin/verification/stats
 * @desc    Get verification statistics
 * @access  Superadmin only
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/superadmin/verification/:restaurantId/details
 * @desc    Get detailed restaurant verification information
 * @access  Superadmin only
 */
router.get('/:restaurantId/details', validateRestaurantId, getRestaurantDetails);

/**
 * @route   PATCH /api/superadmin/verification/:restaurantId
 * @desc    Update restaurant verification status
 * @access  Superadmin only
 */
router.patch('/:restaurantId', validateRestaurantId, validateVerificationStatus, updateStatus);

/**
 * @route   PATCH /api/superadmin/verification/bulk
 * @desc    Bulk update verification status for multiple restaurants
 * @access  Superadmin only
 */
router.patch('/bulk', validateVerificationStatus, bulkUpdateStatus);

export default router; 