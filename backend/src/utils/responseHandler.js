export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const paginatedResponse = (res, data, page, limit, total) => {
  return res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * Create a standardized success response object
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (message, data = null, meta = {}) => {
  return {
    success: true,
    message,
    data,
    ...meta
  };
};

/**
 * Create a standardized error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Additional error details
 * @returns {Object} Standardized error response
 */
export const createErrorResponse = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    ...(errors && { errors })
  };
}; 