import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import Superadmin from '../../models/Superadmin.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';
import { generateSecureToken } from '../utils/crypto.js';

/**
 * Generate JWT access token with short expiration
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Token expiration (default: 15 minutes)
 * @returns {string} - JWT access token
 */
export const generateAccessToken = (payload, expiresIn = '1h') => {
  console.log ('Access token generated for 1h ---------------');
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn,
    issuer: 'fatoorty-api',
    audience: 'fatoorty-client'
  });
};

/**
 * Generate JWT refresh token with long expiration
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Token expiration (default: 7 days)
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn,
    issuer: 'fatoorty-api',
    audience: 'fatoorty-client'
  });
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'fatoorty-api',
      audience: 'fatoorty-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Authenticate superadmin with email and password
 * @param {string} email - Superadmin email
 * @param {string} password - Superadmin password
 * @returns {object} - { accessToken, refreshToken, superadmin }
 * @throws {Error} - If credentials are invalid
 */
export const loginSuperadmin = async (email, password) => {
  // Input validation and sanitization
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Email and password are required');
  }

  // Sanitize inputs
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    throw new Error('Invalid email format');
  }

  // Prevent NoSQL injection by ensuring email is a string
  if (typeof sanitizedEmail !== 'string' || sanitizedEmail.length > 254) {
    throw new Error('Invalid email format');
  }

  // Prevent password injection attacks
  if (typeof sanitizedPassword !== 'string' || sanitizedPassword.length > 128) {
    throw new Error('Invalid password format');
  }

  const superadmin = await Superadmin.findOne({ email: sanitizedEmail });
  if (!superadmin || !(await superadmin.comparePassword(sanitizedPassword))) {
    throw new Error('Invalid credentials');
  }
  
  // Generate secure token ID for this login session
  const tokenId = generateSecureToken(16);
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    id: superadmin._id,
    email: superadmin.email,
    role: 'superadmin',
    tokenId,
    iat: currentTime
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ 
    id: superadmin._id, 
    role: 'superadmin',
    tokenId,
    type: 'refresh'
  });
  
  return { accessToken, refreshToken, superadmin };
};

/**
 * Authenticate restaurant owner with email and password
 * @param {string} email - Restaurant owner email
 * @param {string} password - Restaurant owner password
 * @returns {object} - { accessToken, refreshToken, owner }
 * @throws {Error} - If credentials are invalid
 */
export const loginRestaurantOwner = async (email, password) => {
  // Input validation and sanitization
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Email and password are required');
  }

  // Sanitize inputs
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    throw new Error('Invalid email format');
  }

  // Prevent NoSQL injection by ensuring email is a string
  if (typeof sanitizedEmail !== 'string' || sanitizedEmail.length > 254) {
    throw new Error('Invalid email format');
  }

  // Prevent password injection attacks
  if (typeof sanitizedPassword !== 'string' || sanitizedPassword.length > 128) {
    throw new Error('Invalid password format');
  }

  const owner = await RestaurantOwner.findOne({ email: sanitizedEmail });
  if (!owner || !(await owner.comparePassword(sanitizedPassword))) {
    throw new Error('Invalid credentials');
  }
  
  // Generate secure token ID for this login session
  const tokenId = generateSecureToken(16);
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    id: owner._id,
    email: owner.email,
    role: 'restaurantOwner',
    tokenId,
    iat: currentTime
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ 
    id: owner._id, 
    role: 'restaurantOwner',
    tokenId,
    type: 'refresh'
  });
  
  return { accessToken, refreshToken, owner };
};

/**
 * Refresh access token using valid refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {object} - { accessToken, refreshToken?, user }
 * @throws {Error} - If refresh token is invalid
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    
    // Validate refresh token structure
    if (!decoded.type || decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    if (!decoded.role || !['superadmin', 'restaurantOwner'].includes(decoded.role)) {
      throw new Error('Invalid token role');
    }
    
    // Verify user still exists and is active
    let user = null;
    if (decoded.role === 'superadmin') {
      user = await Superadmin.findById(decoded.id);
    } else if (decoded.role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(decoded.id);
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens with same tokenId to maintain session consistency
    const currentTime = Math.floor(Date.now() / 1000);
    
    const accessTokenPayload = {
      id: user._id,
      email: user.email,
      role: decoded.role,
      tokenId: decoded.tokenId,
      iat: currentTime
    };
    
    const newAccessToken = generateAccessToken(accessTokenPayload);
    
    // Optional: Rotate refresh token for enhanced security
    const newRefreshToken = generateRefreshToken({ 
      id: user._id, 
      role: decoded.role,
      tokenId: decoded.tokenId,
      type: 'refresh'
    });
    
    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken,
      user 
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Logout user (Pure JWT approach - mainly clears cookies)
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @param {string} tokenId - Token ID for session tracking (optional)
 * @returns {boolean} - Success status
 */
export const logoutUser = async (userId, role, tokenId = null) => {
  try {
    // Verify user exists
    let user = null;
    if (role === 'superadmin') {
      user = await Superadmin.findById(userId);
    } else if (role === 'restaurantOwner') {
      user = await RestaurantOwner.findById(userId);
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // In pure JWT approach, logout is mainly handled by clearing cookies
    // We could implement token blacklisting here if needed for enhanced security
    // For now, we'll just log the logout event
    
    console.log(`User ${userId} (${role}) logged out${tokenId ? ` - Token ID: ${tokenId}` : ''}`);
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}; 