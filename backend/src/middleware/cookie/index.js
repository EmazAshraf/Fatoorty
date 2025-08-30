import cookieParser from 'cookie-parser';
import config from '../../config/index.js';

/**
 * Cookie Configuration
 * Secure cookie settings for authentication
 */
export const cookieConfig = {
  // Authentication cookies
  auth: {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: config.server.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: config.server.nodeEnv === 'production' ? undefined : 'localhost',
  },
  
  // Refresh token cookies
  refresh: {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: config.server.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
    domain: config.server.nodeEnv === 'production' ? undefined : 'localhost',
  }
};

/**
 * Cookie Parser Middleware
 */
export const cookieParserMiddleware = cookieParser(config.jwt.secret);

/**
 * Set Authentication Cookies
 */
export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    ...cookieConfig.auth,
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  });
  
  // Set refresh token cookie
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, cookieConfig.refresh);
  }
};

/**
 * Clear Authentication Cookies
 */
export const clearAuthCookies = (res) => {
  // Clear access token cookie
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: config.server.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/',
    domain: config.server.nodeEnv === 'production' ? undefined : 'localhost',
  });
  
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: config.server.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/',
    domain: config.server.nodeEnv === 'production' ? undefined : 'localhost',
  });
};