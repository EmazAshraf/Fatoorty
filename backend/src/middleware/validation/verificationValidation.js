import { createError } from '../error/errorHandler.js';

/**
 * Validate verification status update request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateVerificationStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'verified', 'rejected'];

  // Check if status is provided
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Verification status is required'
    });
  }

  // Check if status is valid
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid verification status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  // For bulk operations, validate restaurantIds array
  if (req.path === '/bulk') {
    const { restaurantIds } = req.body;
    
    if (!restaurantIds) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant IDs array is required for bulk operations'
      });
    }

    if (!Array.isArray(restaurantIds)) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant IDs must be an array'
      });
    }

    if (restaurantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant IDs array cannot be empty'
      });
    }

    // Validate each restaurant ID format
    const mongoose = require('mongoose');
    for (const id of restaurantIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid restaurant ID format: ${id}`
        });
      }
    }
  }

  next();
};

/**
 * Validate query parameters for verification listing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateVerificationQuery = (req, res, next) => {
  const { page, limit, status, sortBy, sortOrder } = req.query;
  const validStatuses = ['all', 'pending', 'verified', 'rejected'];
  const validSortFields = ['createdAt', 'updatedAt', 'name', 'verificationStatus'];
  const validSortOrders = ['asc', 'desc'];

  // Validate page number
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }

  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a positive integer between 1 and 100'
    });
  }

  // Validate status filter
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  // Validate sort field
  if (sortBy && !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
    });
  }

  // Validate sort order
  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sort order. Must be one of: ${validSortOrders.join(', ')}`
    });
  }

  // Validate date range if provided
  const { startDate, endDate } = req.query;
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format. Use YYYY-MM-DD'
    });
  }

  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format. Use YYYY-MM-DD'
    });
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be after end date'
    });
  }

  next();
};

/**
 * Validate restaurant ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRestaurantId = (req, res, next) => {
  const { restaurantId } = req.params;
  const mongoose = require('mongoose');

  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'Restaurant ID is required'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid restaurant ID format'
    });
  }

  next();
};

/**
 * Helper function to validate date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid date format
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}; 