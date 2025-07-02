import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { AuthenticationError, AuthorizationError } from '../error/errorHandler.js';
import User from '../../../models/User.js';
import Superadmin from '../../../models/Superadmin.js';
import RestaurantOwner from '../../../models/RestaurantOwner.js';

/**
 * Unified Authentication Middleware
 * Handles authentication for all user types
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (!decoded) {
      throw new AuthenticationError('Invalid token');
    }

    // Find user based on token payload
    let user = null;
    
    if (decoded.role === 'superadmin') {
      user = await Superadmin.findById(decoded.id);
    } else if (decoded.role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if session is still valid
    if (user.sessionId && user.sessionId !== decoded.sessionId) {
      throw new AuthenticationError('Session expired');
    }

    req.user = user;
    req.userType = decoded.role || 'user';
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
 * Superadmin Only Middleware
 */
export const requireSuperadmin = authorize('superadmin');

/**
 * Restaurant Owner Only Middleware
 */
export const requireRestaurantOwner = authorize('restaurantOwner');

/**
 * User Only Middleware
 */
export const requireUser = authorize('user');

/**
 * Optional Authentication
 * Allows requests with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (!decoded) {
      return next();
    }

    let user = null;
    
    if (decoded.role === 'superadmin') {
      user = await Superadmin.findById(decoded.id);
    } else if (decoded.role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (user && (!user.sessionId || user.sessionId === decoded.sessionId)) {
      req.user = user;
      req.userType = decoded.role || 'user';
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 