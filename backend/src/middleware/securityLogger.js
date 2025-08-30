/**
 * Security Event Logging Middleware
 * Logs security-related events for monitoring and audit
 */

/**
 * Security event types
 */
export const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'LOGOUT_FAILURE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILURE: 'TOKEN_REFRESH_FAILURE',
  INVALID_TOKEN: 'INVALID_TOKEN',
  AUTHORIZATION_FAILURE: 'AUTHORIZATION_FAILURE',
  VALIDATION_FAILURE: 'VALIDATION_FAILURE',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
};

/**
 * Get client information from request
 */
const getClientInfo = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const origin = req.headers.origin || req.headers.referer || 'Unknown';
  
  return {
    ip: ip?.replace('::ffff:', '') || 'Unknown',
    userAgent: userAgent.substring(0, 200), // Limit length
    origin: origin.substring(0, 100),
    method: req.method,
    url: req.originalUrl || req.url,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log security event
 * @param {string} event - Event type
 * @param {object} req - Express request object
 * @param {object} data - Additional event data
 * @param {string} level - Log level (info, warn, error)
 */
export const logSecurityEvent = (event, req, data = {}, level = 'info') => {
  const clientInfo = getClientInfo(req);
  
  const logEntry = {
    event,
    level,
    ...clientInfo,
    userId: data.userId || req.user?.id || 'Anonymous',
    userType: data.userType || req.userType || 'Unknown',
    sessionId: data.sessionId || req.tokenId || 'Unknown',
    details: data.details || {},
    ...data
  };
  
  // Log to console (in production, this should go to a proper logging service)
  const logMessage = `[SECURITY] ${event} - IP: ${clientInfo.ip} - User: ${logEntry.userId} (${logEntry.userType}) - ${JSON.stringify(logEntry.details)}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, logEntry);
      break;
    case 'warn':
      console.warn(logMessage, logEntry);
      break;
    default:
      console.log(logMessage, logEntry);
  }
  
  // In production, you might want to:
  // - Send to external logging service (e.g., Winston, Bunyan)
  // - Store in database for audit trail
  // - Send alerts for critical events
  // - Integrate with SIEM systems
};

/**
 * Security logging middleware for authentication events
 */
export const logAuthEvents = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      // Parse response data
      let responseData = {};
      if (typeof data === 'string') {
        try {
          responseData = JSON.parse(data);
        } catch (e) {
          responseData = { message: data };
        }
      } else {
        responseData = data;
      }
      
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      const path = req.route?.path || req.originalUrl;
      
      // Log based on endpoint and success status
      if (path.includes('/login')) {
        if (isSuccess) {
          logSecurityEvent(SECURITY_EVENTS.LOGIN_SUCCESS, req, {
            userId: responseData.data?.owner?.id || responseData.data?.superadmin?.id,
            userType: req.originalUrl.includes('superadmin') ? 'superadmin' : 'restaurantOwner',
            details: { endpoint: path }
          }, 'info');
        } else {
          logSecurityEvent(SECURITY_EVENTS.LOGIN_FAILURE, req, {
            details: { 
              endpoint: path, 
              error: responseData.message || 'Login failed',
              statusCode: res.statusCode 
            }
          }, 'warn');
        }
      } else if (path.includes('/logout')) {
        logSecurityEvent(SECURITY_EVENTS.LOGOUT_SUCCESS, req, {
          userId: req.user?.id,
          userType: req.userType,
          details: { endpoint: path }
        }, 'info');
      } else if (path.includes('/refresh')) {
        if (isSuccess) {
          logSecurityEvent(SECURITY_EVENTS.TOKEN_REFRESH, req, {
            userId: req.user?.id,
            userType: req.userType,
            details: { endpoint: path }
          }, 'info');
        } else {
          logSecurityEvent(SECURITY_EVENTS.TOKEN_REFRESH_FAILURE, req, {
            details: { 
              endpoint: path, 
              error: responseData.message || 'Token refresh failed',
              statusCode: res.statusCode 
            }
          }, 'warn');
        }
      }
    } catch (error) {
      console.error('Error in security logging middleware:', error);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};



/**
 * Security logging middleware for validation failures
 */
export const logValidationEvents = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 400) {
      try {
        let responseData = {};
        if (typeof data === 'string') {
          try {
            responseData = JSON.parse(data);
          } catch (e) {
            responseData = { message: data };
          }
        } else {
          responseData = data;
        }
        
        if (responseData.message === 'Validation failed' || responseData.errors) {
          logSecurityEvent(SECURITY_EVENTS.VALIDATION_FAILURE, req, {
            details: { 
              endpoint: req.originalUrl,
              errors: responseData.errors || [responseData.message],
              body: req.body ? Object.keys(req.body) : []
            }
          }, 'info');
        }
      } catch (error) {
        console.error('Error in validation logging middleware:', error);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Comprehensive security logging middleware
 * Combines all security event logging
 */
export const securityLogger = (req, res, next) => {
  // Apply all security logging middlewares
  logAuthEvents(req, res, () => {
    logValidationEvents(req, res, next);
  });
};