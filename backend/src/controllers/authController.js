import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';
import Superadmin from '../../models/Superadmin.js';

/**
 * General Authentication Controller
 * Handles shared authentication operations
 */
class AuthController {
  /**
   * Get current authenticated user information
   * GET /api/auth/me
   * Requires authentication middleware
   */
  async getCurrentUser(req, res) {
    try {
      // User is already authenticated by middleware
      const { user, userType } = req;
      
      if (!user || !userType) {
        return res.status(401).json(createErrorResponse('Not authenticated', 401));
      }

      let userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userType === 'restaurantOwner' ? 'restaurantOwner' : 'superadmin'
      };

      let responseData = {
        success: true,
        user: userData
      };

      // If it's a restaurant owner, include restaurant data
      if (userType === 'restaurantOwner') {
        try {
          const restaurantOwner = await RestaurantOwner.findById(user._id)
            .populate('restaurant', 'name type address logo verificationStatus status')
            .select('restaurant');

          if (restaurantOwner?.restaurant) {
            responseData.restaurant = {
              id: restaurantOwner.restaurant._id,
              name: restaurantOwner.restaurant.name,
              type: restaurantOwner.restaurant.type,
              address: restaurantOwner.restaurant.address,
              logo: restaurantOwner.restaurant.logo,
              verificationStatus: restaurantOwner.restaurant.verificationStatus,
              status: restaurantOwner.restaurant.status
            };
          }
        } catch (error) {
          console.warn('Failed to fetch restaurant data:', error.message);
          // Continue without restaurant data
        }
      }

      res.json(responseData);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json(createErrorResponse('Failed to get user information', 500));
    }
  }
}

const authController = new AuthController();

// Export individual methods
export const getCurrentUser = authController.getCurrentUser.bind(authController);

// Export the controller instance
export default authController;
