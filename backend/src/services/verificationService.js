import Restaurant from '../../models/Restaurant.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';
import { createError } from '../middleware/error/errorHandler.js';

/**
 * Get paginated restaurant verifications with filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by verification status
 * @param {string} options.search - Search term
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @param {string} options.startDate - Start date filter
 * @param {string} options.endDate - End date filter
 * @returns {Object} Paginated results with metadata
 */
export const getRestaurantVerifications = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status = 'all',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate = '',
    endDate = ''
  } = options;

  // Build query
  const query = { isDeleted: false };
  
  // Status filter
  if (status !== 'all') {
    query.verificationStatus = status;
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } }
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate skip value
  const skip = (page - 1) * limit;

  try {
    // Execute query with pagination
    const [restaurants, totalCount] = await Promise.all([
      Restaurant.find(query)
        .populate('ownerId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Restaurant.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform data for frontend
    const transformedRestaurants = restaurants.map(restaurant => ({
      id: restaurant._id,
      name: restaurant.name,
      email: restaurant.ownerId?.email || '',
      address: restaurant.address,
      type: restaurant.type,
      verificationStatus: restaurant.verificationStatus,
      status: restaurant.status,
      logo: restaurant.logo,
      governmentIdUrl: restaurant.verificationGovIdUrl,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      owner: {
        id: restaurant.ownerId?._id,
        name: restaurant.ownerId?.name || '',
        email: restaurant.ownerId?.email || '',
        phone: restaurant.ownerId?.phone || ''
      }
    }));

    return {
      data: transformedRestaurants,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    throw createError(500, 'Failed to fetch restaurant verifications', error);
  }
};

/**
 * Update restaurant verification status
 * @param {string} restaurantId - Restaurant ID
 * @param {string} status - New verification status
 * @param {string} superadminId - Superadmin ID performing the action
 * @returns {Object} Updated restaurant data
 */
export const updateVerificationStatus = async (restaurantId, status, superadminId) => {
  if (!['pending', 'verified', 'rejected'].includes(status)) {
    throw createError(400, 'Invalid verification status');
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      throw createError(404, 'Restaurant not found');
    }

    if (restaurant.isDeleted) {
      throw createError(404, 'Restaurant has been deleted');
    }

    // Update verification status
    restaurant.verificationStatus = status;
    restaurant.updatedAt = new Date();

    // If verified, ensure restaurant is active
    if (status === 'verified') {
      restaurant.status = 'active';
    }

    await restaurant.save();

    // Populate owner data for response
    await restaurant.populate('ownerId', 'name email phone');

    return {
      id: restaurant._id,
      name: restaurant.name,
      verificationStatus: restaurant.verificationStatus,
      status: restaurant.status,
      updatedAt: restaurant.updatedAt,
      owner: {
        id: restaurant.ownerId._id,
        name: restaurant.ownerId.name,
        email: restaurant.ownerId.email,
        phone: restaurant.ownerId.phone
      }
    };
  } catch (error) {
    if (error.status) throw error;
    throw createError(500, 'Failed to update verification status', error);
  }
};

/**
 * Bulk update verification status for multiple restaurants
 * @param {Array} restaurantIds - Array of restaurant IDs
 * @param {string} status - New verification status
 * @param {string} superadminId - Superadmin ID performing the action
 * @returns {Object} Bulk update results
 */
export const bulkUpdateVerificationStatus = async (restaurantIds, status, superadminId) => {
  if (!['pending', 'verified', 'rejected'].includes(status)) {
    throw createError(400, 'Invalid verification status');
  }

  if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
    throw createError(400, 'Restaurant IDs array is required');
  }

  try {
    const updateData = {
      verificationStatus: status,
      updatedAt: new Date()
    };

    // If verified, ensure restaurants are active
    if (status === 'verified') {
      updateData.status = 'active';
    }

    const result = await Restaurant.updateMany(
      {
        _id: { $in: restaurantIds },
        isDeleted: false
      },
      updateData
    );

    if (result.matchedCount === 0) {
      throw createError(404, 'No valid restaurants found');
    }

    return {
      success: true,
      updatedCount: result.modifiedCount,
      totalCount: result.matchedCount
    };
  } catch (error) {
    if (error.status) throw error;
    throw createError(500, 'Failed to bulk update verification status', error);
  }
};

/**
 * Get verification statistics
 * @returns {Object} Verification statistics
 */
export const getVerificationStats = async () => {
  try {
    const [total, pending, verified, rejected] = await Promise.all([
      Restaurant.countDocuments({ isDeleted: false }),
      Restaurant.countDocuments({ verificationStatus: 'pending', isDeleted: false }),
      Restaurant.countDocuments({ verificationStatus: 'verified', isDeleted: false }),
      Restaurant.countDocuments({ verificationStatus: 'rejected', isDeleted: false })
    ]);

    return {
      totalRestaurants: total,
      pendingVerifications: pending,
      verifiedRestaurants: verified,
      rejectedVerifications: rejected
    };
  } catch (error) {
    throw createError(500, 'Failed to fetch verification statistics', error);
  }
};

/**
 * Get restaurant verification details by ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Object} Restaurant verification details
 */
export const getRestaurantVerificationDetails = async (restaurantId) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId)
      .populate('ownerId', 'name email phone createdAt')
      .lean();

    if (!restaurant) {
      throw createError(404, 'Restaurant not found');
    }

    if (restaurant.isDeleted) {
      throw createError(404, 'Restaurant has been deleted');
    }

    return {
      id: restaurant._id,
      name: restaurant.name,
      email: restaurant.ownerId?.email || '',
      address: restaurant.address,
      type: restaurant.type,
      verificationStatus: restaurant.verificationStatus,
      status: restaurant.status,
      logo: restaurant.logo,
      governmentIdUrl: restaurant.verificationGovIdUrl,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      owner: {
        id: restaurant.ownerId?._id,
        name: restaurant.ownerId?.name || '',
        email: restaurant.ownerId?.email || '',
        phone: restaurant.ownerId?.phone || '',
        createdAt: restaurant.ownerId?.createdAt
      }
    };
  } catch (error) {
    if (error.status) throw error;
    throw createError(500, 'Failed to fetch restaurant details', error);
  }
}; 