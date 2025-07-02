import { asyncHandler } from '../middleware/error/errorHandler.js';
import { getRestaurantStatus } from '../services/restaurantService.js';
import Restaurant from '../../models/Restaurant.js';

export const getStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json({ 
      success: false,
      message: 'Restaurant not found' 
    });
  }

  // Determine if user can access dashboard
  const canAccessDashboard = restaurant.verificationStatus === 'verified' && restaurant.status === 'active';

  // Create access message based on status
  let accessMessage = '';
  if (restaurant.verificationStatus === 'pending') {
    accessMessage = 'Your restaurant verification is pending. Please wait for approval.';
  } else if (restaurant.verificationStatus === 'rejected') {
    accessMessage = 'Your restaurant verification was rejected. Please contact support.';
  } else if (restaurant.status === 'suspended') {
    accessMessage = 'Your restaurant account is suspended. Please contact support.';
  } else if (canAccessDashboard) {
    accessMessage = 'Welcome! You have full access to your dashboard.';
  }

  res.json({ 
    success: true,
    restaurant: {
      id: restaurant._id,
      name: restaurant.name,
      verificationStatus: restaurant.verificationStatus,
      status: restaurant.status,
      type: restaurant.type,
      address: restaurant.address,
      logo: restaurant.logo
    },
    access: {
      canAccessDashboard,
      message: accessMessage
    }
  });
}); 