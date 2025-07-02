import { asyncHandler } from '../middleware/error/errorHandler.js';
import { 
  getRestaurantVerifications,
  updateVerificationStatus,
  bulkUpdateVerificationStatus,
  getVerificationStats,
  getRestaurantVerificationDetails
} from '../services/verificationService.js';
import { createSuccessResponse } from '../utils/responseHandler.js';

/**
 * Get paginated restaurant verifications with filters
 * GET /api/superadmin/verification
 */
export const getVerifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate = '',
    endDate = ''
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    search,
    sortBy,
    sortOrder,
    startDate,
    endDate
  };

  const result = await getRestaurantVerifications(options);
  
  res.json(createSuccessResponse(
    'Restaurant verifications retrieved successfully',
    result.data,
    { pagination: result.pagination }
  ));
});

/**
 * Update restaurant verification status
 * PATCH /api/superadmin/verification/:restaurantId
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { status } = req.body;
  const superadminId = req.user._id;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  const result = await updateVerificationStatus(restaurantId, status, superadminId);
  
  res.json(createSuccessResponse(
    `Restaurant verification status updated to ${status}`,
    result
  ));
});

/**
 * Bulk update verification status for multiple restaurants
 * PATCH /api/superadmin/verification/bulk
 */
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { restaurantIds, status } = req.body;
  const superadminId = req.user._id;

  if (!restaurantIds || !status) {
    return res.status(400).json({
      success: false,
      message: 'Restaurant IDs and status are required'
    });
  }

  const result = await bulkUpdateVerificationStatus(restaurantIds, status, superadminId);
  
  res.json(createSuccessResponse(
    `Bulk update completed: ${result.updatedCount} restaurants updated`,
    result
  ));
});

/**
 * Get verification statistics
 * GET /api/superadmin/verification/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getVerificationStats();
  
  res.json(createSuccessResponse(
    'Verification statistics retrieved successfully',
    stats
  ));
});

/**
 * Get restaurant verification details by ID
 * GET /api/superadmin/verification/:restaurantId/details
 */
export const getRestaurantDetails = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  
  const details = await getRestaurantVerificationDetails(restaurantId);
  
  res.json(createSuccessResponse(
    'Restaurant verification details retrieved successfully',
    details
  ));
});

 