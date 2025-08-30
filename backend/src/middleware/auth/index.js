import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { AuthenticationError, AuthorizationError } from '../error/errorHandler.js';
import User from '../../../models/User.js';
import Superadmin from '../../../models/Superadmin.js';
import RestaurantOwner from '../../../models/RestaurantOwner.js';

/**
 * Extract token from request (cookie or header)
 */
const extractToken = (req) => {

  // First try to get token from cookie
  const tokenFromCookie = req.cookies?.accessToken;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Unified Authentication Middleware (Pure JWT)
 * Handles authentication for restaurant owners and superadmins
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token using the improved verifyToken function
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'fatoorty-api',
      audience: 'fatoorty-client'
    });
    
    if (!decoded) {
      throw new AuthenticationError('Invalid token');
    }

    // Validate token structure
    if (!decoded.role || !['superadmin', 'restaurantOwner'].includes(decoded.role)) {
      throw new AuthenticationError('Invalid token role');
    }

    if (!decoded.id || !decoded.tokenId) {
      throw new AuthenticationError('Invalid token structure');
    }

    // Optional: Verify user still exists (lightweight check)
    // Only for critical operations - for performance, we trust the JWT
    let user = null;
    
    if (decoded.role === 'superadmin') {
      user = await Superadmin.findById(decoded.id).select('_id email name');
    } else if (decoded.role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(decoded.id).select('_id email name');
    }

    if (!user) {  
      throw new AuthenticationError('User not found');
    }

    // Set user info on request object
    req.user = user;
    req.userType = decoded.role;
    req.tokenId = decoded.tokenId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!roles.includes(req.userType)) {
      return next(new AuthorizationError('Access denied'));
    }

    next();
  };
};

/**
 * Role-specific middleware
 */
export const requireSuperadmin = authorize('superadmin');
export const requireRestaurantOwner = authorize('restaurantOwner');
export const requireUser = authorize('user');

/**
 * Optional Authentication (Pure JWT)
 * Allows requests with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'fatoorty-api',
      audience: 'fatoorty-client'
    });
    
    if (!decoded || !decoded.role || !['superadmin', 'restaurantOwner'].includes(decoded.role)) {
      return next();
    }

    // Lightweight user verification
    let user = null;
    
    if (decoded.role === 'superadmin') {
      user = await Superadmin.findById(decoded.id).select('_id email name');
    } else if (decoded.role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(decoded.id).select('_id email name');
    }

    if (user) {
      req.user = user;
      req.userType = decoded.role;
      req.tokenId = decoded.tokenId;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 