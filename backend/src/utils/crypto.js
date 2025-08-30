import crypto from 'crypto';

/**
 * Secure cryptographic utilities for authentication
 * Replaces insecure Math.random() usage throughout the application
 */

/**
 * Generate cryptographically secure random token
 * @param {number} bytes - Number of random bytes to generate
 * @returns {string} - Hex encoded secure random token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate secure session identifier
 * @returns {string} - Secure session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate secure API key
 * @returns {string} - Secure API key
 */
export const generateApiKey = () => {
  return crypto.randomBytes(32).toString('base64url');
};

/**
 * Generate secure random string for passwords, etc.
 * @param {number} length - Length of the random string
 * @returns {string} - Secure random string
 */
export const generateSecureRandomString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};

/**
 * Hash sensitive data with salt
 * @param {string} data - Data to hash
 * @param {string} salt - Optional salt (generates if not provided)
 * @returns {object} - { hash, salt }
 */
export const hashWithSalt = (data, salt = null) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  
  return { hash, salt };
};

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hash - Stored hash
 * @param {string} salt - Stored salt
 * @returns {boolean} - True if data matches hash
 */
export const verifyHash = (data, hash, salt) => {
  const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};