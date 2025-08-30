/**
 * Comprehensive Input Validation and Sanitization Middleware
 * Protects against common security vulnerabilities
 */

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') return input;
  
  const {
    trim = true,
    removeHTML = true,
    maxLength = 1000,
    allowedChars = null
  } = options;
  
  let sanitized = input;
  
  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  // Remove HTML tags
  if (removeHTML) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Limit length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Allow only specific characters
  if (allowedChars) {
    sanitized = sanitized.replace(allowedChars, '');
  }
  
  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with errors
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
  // International phone number regex (simplified)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Authentication validation middleware
 */
export const validateAuth = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;
  
  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  } else if (email.length > 254) {
    errors.push('Email address is too long');
  }
  
  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Sanitize inputs
  req.body.email = sanitizeString(email.toLowerCase(), { maxLength: 254 });
  req.body.password = password; // Don't sanitize password to preserve special chars
  
  next();
};

/**
 * Restaurant signup validation middleware
 */
export const validateRestaurantSignup = (req, res, next) => {
  const errors = [];
  const { 
    name, 
    email, 
    password, 
    phone, 
    restaurantName, 
    restaurantType, 
    address 
  } = req.body;
  
  // Validate name
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Validate password
  if (password) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  // Validate phone
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(phone)) {
    errors.push('Please provide a valid phone number');
  }
  
  // Validate restaurant name
  if (!restaurantName) {
    errors.push('Restaurant name is required');
  } else if (typeof restaurantName !== 'string') {
    errors.push('Restaurant name must be a string');
  } else if (restaurantName.trim().length < 2) {
    errors.push('Restaurant name must be at least 2 characters long');
  } else if (restaurantName.trim().length > 100) {
    errors.push('Restaurant name must be less than 100 characters');
  }
  
  // Validate restaurant type
  const validTypes = ['fast-food', 'casual-dining', 'fine-dining', 'cafe', 'bakery', 'other'];
  if (!restaurantType) {
    errors.push('Restaurant type is required');
  } else if (!validTypes.includes(restaurantType)) {
    errors.push('Please select a valid restaurant type');
  }
  
  // Validate address
  if (!address) {
    errors.push('Address is required');
  } else if (typeof address !== 'string') {
    errors.push('Address must be a string');
  } else if (address.trim().length < 10) {
    errors.push('Address must be at least 10 characters long');
  } else if (address.trim().length > 500) {
    errors.push('Address must be less than 500 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Sanitize inputs
  req.body.name = sanitizeString(name, { maxLength: 100 });
  req.body.email = sanitizeString(email.toLowerCase(), { maxLength: 254 });
  req.body.phone = sanitizeString(phone, { maxLength: 20 });
  req.body.restaurantName = sanitizeString(restaurantName, { maxLength: 100 });
  req.body.restaurantType = restaurantType;
  req.body.address = sanitizeString(address, { maxLength: 500 });
  
  next();
};

/**
 * Profile update validation middleware
 */
export const validateProfileUpdate = (req, res, next) => {
  const errors = [];
  const { name, email, phone, restaurantName, restaurantType, address } = req.body;
  
  // Validate name (optional)
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.trim().length > 100) {
      errors.push('Name must be less than 100 characters');
    } else {
      req.body.name = sanitizeString(name, { maxLength: 100 });
    }
  }
  
  // Validate email (optional)
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    } else {
      req.body.email = sanitizeString(email.toLowerCase(), { maxLength: 254 });
    }
  }
  
  // Validate phone (optional)
  if (phone !== undefined) {
    if (!isValidPhone(phone)) {
      errors.push('Please provide a valid phone number');
    } else {
      req.body.phone = sanitizeString(phone, { maxLength: 20 });
    }
  }
  
  // Validate restaurant name (optional)
  if (restaurantName !== undefined) {
    if (typeof restaurantName !== 'string') {
      errors.push('Restaurant name must be a string');
    } else if (restaurantName.trim().length < 2) {
      errors.push('Restaurant name must be at least 2 characters long');
    } else if (restaurantName.trim().length > 100) {
      errors.push('Restaurant name must be less than 100 characters');
    } else {
      req.body.restaurantName = sanitizeString(restaurantName, { maxLength: 100 });
    }
  }
  
  // Validate restaurant type (optional)
  if (restaurantType !== undefined) {
    const validTypes = ['fast-food', 'casual-dining', 'fine-dining', 'cafe', 'bakery', 'other'];
    if (!validTypes.includes(restaurantType)) {
      errors.push('Please select a valid restaurant type');
    }
  }
  
  // Validate address (optional)
  if (address !== undefined) {
    if (typeof address !== 'string') {
      errors.push('Address must be a string');
    } else if (address.trim().length < 10) {
      errors.push('Address must be at least 10 characters long');
    } else if (address.trim().length > 500) {
      errors.push('Address must be less than 500 characters');
    } else {
      req.body.address = sanitizeString(address, { maxLength: 500 });
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

/**
 * Password change validation middleware
 */
export const validatePasswordChange = (req, res, next) => {
  const errors = [];
  const { currentPassword, newPassword } = req.body;
  
  // Validate current password
  if (!currentPassword) {
    errors.push('Current password is required');
  } else if (typeof currentPassword !== 'string') {
    errors.push('Current password must be a string');
  }
  
  // Validate new password
  if (!newPassword) {
    errors.push('New password is required');
  } else if (typeof newPassword !== 'string') {
    errors.push('New password must be a string');
  } else {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  // Check if passwords are the same
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

/**
 * MongoDB ObjectId validation middleware
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} parameter is required`
      });
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Export utility functions as well
export {
  sanitizeString,
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidObjectId
};