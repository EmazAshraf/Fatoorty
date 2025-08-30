import config from '../../config/index.js';
import { logSecurityEvent, SECURITY_EVENTS } from '../securityLogger.js';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Global Error Handler Middleware with Security Logging
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging
  const errorContext = {
    message: err.message,
    stack: config.server.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'Anonymous',
    userType: req.userType || 'Unknown',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      'content-type': req.headers['content-type']
    }
  };

  console.error('❌ Error:', errorContext);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
    
    // Log security event
    logSecurityEvent(SECURITY_EVENTS.INVALID_TOKEN, req, {
      details: { 
        error: 'JsonWebTokenError',
        originalMessage: err.message
      }
    }, 'warn');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
    
    // Log security event
    logSecurityEvent(SECURITY_EVENTS.INVALID_TOKEN, req, {
      details: { 
        error: 'TokenExpiredError',
        originalMessage: err.message
      }
    }, 'warn');
  }

  // Authentication errors
  if (error instanceof AuthenticationError) {
    logSecurityEvent(SECURITY_EVENTS.AUTHORIZATION_FAILURE, req, {
      details: { 
        error: 'AuthenticationError',
        message: error.message
      }
    }, 'warn');
  }

  // Authorization errors
  if (error instanceof AuthorizationError) {
    logSecurityEvent(SECURITY_EVENTS.AUTHORIZATION_FAILURE, req, {
      details: { 
        error: 'AuthorizationError',
        message: error.message
      }
    }, 'warn');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ValidationError(message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ValidationError(message);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Development error response
  if (config.server.nodeEnv === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack,
        ...(error.errors && { errors: error.errors }),
      },
    });
  }

  // Production error response - sanitized for security
  let responseMessage = 'Internal Server Error';
  
  if (error.isOperational) {
    responseMessage = message;
  } else if (statusCode >= 400 && statusCode < 500) {
    // Client errors - safe to expose
    responseMessage = message;
  }
  
  // Additional security: Don't expose sensitive paths or internal info
  if (responseMessage.includes('ENOENT') || 
      responseMessage.includes('path') || 
      responseMessage.includes('directory') ||
      responseMessage.includes('file system')) {
    responseMessage = 'Resource not found';
  }
  
  return res.status(statusCode).json({
    success: false,
    error: {
      message: responseMessage,
      statusCode,
    },
  });
};

/**
 * 404 Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async functions to catch errors and pass them to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create a custom error with status code and message
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Error} originalError - Original error object (optional)
 * @returns {AppError} Custom error instance
 */
export const createError = (statusCode, message, originalError = null) => {
  const error = new AppError(message, statusCode);
  if (originalError) {
    error.originalError = originalError;
  }
  return error;
}; 