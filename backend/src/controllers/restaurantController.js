import { asyncHandler } from '../middleware/error/errorHandler.js';
import RestaurantService from '../services/restaurantService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import { setAuthCookies, clearAuthCookies } from '../middleware/cookie/index.js';
import { logoutUser, refreshAccessToken } from '../services/authService.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';

/**
 * Unified Restaurant Controller
 * Handles all restaurant operations with comprehensive security and validation
 */
class RestaurantController {
  /**
   * Restaurant signup with file uploads
   * POST /api/restaurant/auth/signup
   */
  async signup(req, res) {
    try {
      const result = await RestaurantService.createRestaurantAccount(req.body, req.files);
      
      if (result.success) {
        // Set authentication cookies
        setAuthCookies(res, {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        });
        
        res.status(201).json(createSuccessResponse(result.message, result.data));
      } else {
        res.status(400).json(createErrorResponse(result.message, 400));
      }
    } catch (error) {
      console.error('Restaurant signup error:', error);
      res.status(500).json(createErrorResponse('Registration failed', 500));
    }
  }

  /**
   * Restaurant login with status check
   * POST /api/restaurant/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json(createErrorResponse('Email and password are required', 400));
      }

      const result = await RestaurantService.authenticateRestaurant(email, password);
      
      if (result.success) {
        // Set authentication cookies
        setAuthCookies(res, {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        });
        
        res.json(createSuccessResponse(result.message, result.data));
      } else {
        res.status(403).json(createErrorResponse(result.message, 403, result.access));
      }
    } catch (error) {
      console.error('Restaurant login error:', error);
      // Return the specific error message from the service
      const errorMessage = error.message || 'Authentication failed';
      res.status(401).json(createErrorResponse(errorMessage, 401));
    }
  }

  /**
   * Restaurant logout
   * POST /api/restaurant/auth/logout
   */
  async logout(req, res) {
    try {
      // Log logout event with token tracking
      if (req.user) {
        await logoutUser(req.user._id, req.userType, req.tokenId);
      }
      
      // Clear authentication cookies
      clearAuthCookies(res);
      
      res.json(createSuccessResponse('Logged out successfully'));
    } catch (error) {
      console.error('Restaurant logout error:', error);
      
      // Still clear cookies even if logout tracking fails
      clearAuthCookies(res);
      
      res.status(500).json(createErrorResponse('Logout failed', 500));
    }
  }

  /**
   * Refresh access token
   * POST /api/restaurant/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json(createErrorResponse('Refresh token not found', 401));
      }

      const result = await refreshAccessToken(refreshToken);
      
      // Set new authentication cookies with rotated tokens
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // Use new refresh token
      });
      
      res.json(createSuccessResponse('Token refreshed successfully', {
        accessToken: result.accessToken,
        owner: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
        }
      }));
    } catch (error) {
      console.error('Restaurant refresh token error:', error);
      
      // Clear invalid cookies
      clearAuthCookies(res);
      
      res.status(401).json(createErrorResponse('Token refresh failed', 401));
    }
  }

  /**
   * Get unified restaurant profile with status
   * GET /api/restaurant/profile
   */
  async getProfile(req, res) {
    try {
      const result = await RestaurantService.getRestaurantProfile(req.user._id);
      
      res.json(createSuccessResponse(
        'Profile retrieved successfully',
        result.data
      ));
    } catch (error) {
      console.error('Get restaurant profile error:', error);
      res.status(400).json(createErrorResponse('Failed to retrieve profile', 400));
    }
  }

  /**
   * Update restaurant profile (unified - handles all profile updates)
   * PUT /api/restaurant/profile
   */
  async updateProfile(req, res) {
    try {
      console.log('=== UPDATE PROFILE REQUEST START ===');
      console.log('User ID:', req.user._id);
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      console.log('Request File:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'No buffer'
      } : 'No file');
      console.log('Request Headers:', JSON.stringify(req.headers, null, 2));

      const { name, email, phone, restaurantName, restaurantType, address } = req.body;
      
      // Validate that at least one field is provided
      if (!name && !email && !phone && !restaurantName && !restaurantType && !address && !req.file) {
        console.log('❌ No fields provided for update');
        return res.status(400).json(createErrorResponse('At least one field must be provided for update', 400));
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (restaurantName !== undefined) updates.restaurantName = restaurantName;
      if (restaurantType !== undefined) updates.restaurantType = restaurantType;
      if (address !== undefined) updates.address = address;

      console.log('📝 Text updates to process:', updates);
      console.log('📁 File to process:', req.file ? 'YES' : 'NO');

      console.log('🔄 Calling RestaurantService.updateRestaurantProfile...');
      const result = await RestaurantService.updateRestaurantProfile(
        req.user._id, 
        updates, 
        req.file
      );
      
      console.log('✅ Service result:', JSON.stringify(result, null, 2));
      console.log('=== UPDATE PROFILE REQUEST END ===');
      
      res.json(createSuccessResponse(
        result.message,
        result.data
      ));
    } catch (error) {
      console.error('❌ UPDATE PROFILE ERROR:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('=== UPDATE PROFILE ERROR END ===');
      res.status(400).json(createErrorResponse('Failed to update profile', 400));
    }
  }

  /**
   * Change restaurant owner password
   * PUT /api/restaurant/password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json(createErrorResponse('Current password and new password are required', 400));
      }

      const result = await RestaurantService.changeRestaurantPassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      
      res.json(createSuccessResponse(result.message));
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json(createErrorResponse('Failed to change password', 400));
    }
  }
}

// Create controller instance
const restaurantController = new RestaurantController();

// Export controller methods with asyncHandler wrapper
export const signup = asyncHandler(restaurantController.signup.bind(restaurantController));
export const login = asyncHandler(restaurantController.login.bind(restaurantController));
export const logout = asyncHandler(restaurantController.logout.bind(restaurantController));
export const refreshToken = asyncHandler(restaurantController.refreshToken.bind(restaurantController));
export const getProfile = asyncHandler(restaurantController.getProfile.bind(restaurantController));
export const updateProfile = asyncHandler(restaurantController.updateProfile.bind(restaurantController));
export const changePassword = asyncHandler(restaurantController.changePassword.bind(restaurantController));