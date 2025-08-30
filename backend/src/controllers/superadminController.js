import { asyncHandler } from '../middleware/error/errorHandler.js';
import { loginSuperadmin, logoutUser, refreshAccessToken } from '../services/authService.js';
import { setAuthCookies, clearAuthCookies } from '../middleware/cookie/index.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import Superadmin from '../../models/Superadmin.js';
import Restaurant from '../../models/Restaurant.js'; // Added import for Restaurant

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(createErrorResponse('Email and password are required', 400));
  }
  
  try {
    const { accessToken, refreshToken, superadmin } = await loginSuperadmin(email, password);
    
    // Set authentication cookies
    setAuthCookies(res, {
      accessToken,
      refreshToken,
    });
    
    res.json(createSuccessResponse('Login successful', {
      accessToken,
      refreshToken,
      superadmin: {
        id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
      },
    }));
  } catch (error) {
    console.error('Superadmin login error:', error);
    // Return the specific error message from the service
    const errorMessage = error.message || 'Authentication failed';
    res.status(401).json(createErrorResponse(errorMessage, 401));
  }
});

export const logout = asyncHandler(async (req, res) => {
  try {
    // Log logout event with token tracking
    if (req.user) {
      await logoutUser(req.user._id, req.userType, req.tokenId);
    }
    
    // Clear authentication cookies
    clearAuthCookies(res);
    
    res.json(createSuccessResponse('Logged out successfully'));
  } catch (error) {
    console.error('Superadmin logout error:', error);
    
    // Still clear cookies even if logout tracking fails
    clearAuthCookies(res);
    
    res.status(500).json(createErrorResponse('Logout failed', 500));
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
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
      superadmin: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
      }
    }));
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear invalid cookies
    clearAuthCookies(res);
    
    res.status(401).json(createErrorResponse('Token refresh failed', 401));
  }
});

export const getAllSuperadmins = asyncHandler(async (req, res) => {
  const superadmins = await Superadmin.find().select('-password');
  res.json({ superadmins });
});

export const createSuperadmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Enhanced password validation for new superadmin creation
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number' });
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' });
  }
  
  const superadmin = new Superadmin({ name, email, password });
  await superadmin.save();
  res.status(201).json({ superadmin });
});

export const updateSuperadmin = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true }
  ).select('-password');
  res.json({ superadmin });
});

export const getProfile = asyncHandler(async (req, res) => {
  const superadmin = await Superadmin.findById(req.user._id).select('-password');
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  res.json({ superadmin });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true }
  ).select('-password');
  
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  res.json({ superadmin });
});

export const updateProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: req.file.filename },
    { new: true }
  ).select('-password');
  
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  res.json({ 
    message: 'Profile photo updated successfully',
    filename: req.file.filename,
    superadmin 
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  
  // Enhanced password validation
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one number' });
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' });
  }
  
  const superadmin = await Superadmin.findById(req.user._id);
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  const isValidPassword = await superadmin.comparePassword(currentPassword);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  
  superadmin.password = newPassword;
  await superadmin.save();
  
  res.json({ message: 'Password changed successfully' });
});

// Verification controller functions
export const getVerifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  const query = {};
  if (status && status !== 'all') {
    query.verificationStatus = status;
  }
  
  if (search) {
    // Search in restaurant name and owner email
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'ownerId.email': { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const restaurants = await Restaurant.find(query)
    .populate('ownerId', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
  
  const total = await Restaurant.countDocuments(query);
  
  // Transform the data to use 'id' instead of '_id' for frontend compatibility
  const transformedRestaurants = restaurants.map(restaurant => ({
    ...restaurant,
    id: restaurant._id,
    ownerId: {
      ...restaurant.ownerId,
      id: restaurant.ownerId._id
    }
  }));
  
  res.json({
    success: true,
    data: transformedRestaurants,
    pagination: {
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: parseInt(page) < Math.ceil(total / limit),
      hasPrevPage: parseInt(page) > 1
    }
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { status, reason } = req.body;
  
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  
  restaurant.verificationStatus = status;
  if (reason) {
    restaurant.verificationReason = reason;
  }
  
  await restaurant.save();
  
  res.json({ 
    success: true,
    message: 'Verification status updated successfully',
    data: {
      id: restaurant._id,
      verificationStatus: restaurant.verificationStatus,
      verificationReason: restaurant.verificationReason
    }
  });
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { restaurantIds, status, reason } = req.body;
  
  if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
    return res.status(400).json({ message: 'Restaurant IDs array is required' });
  }
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  
  const updateData = { verificationStatus: status };
  if (reason) {
    updateData.verificationReason = reason;
  }
  
  const result = await Restaurant.updateMany(
    { _id: { $in: restaurantIds } },
    updateData
  );
  
  res.json({ 
    success: true,
    message: 'Bulk update completed successfully',
    data: {
      updatedCount: result.modifiedCount
    }
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await Restaurant.aggregate([
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const statsMap = {};
  stats.forEach(stat => {
    statsMap[stat._id || 'pending'] = stat.count;
  });
  
  res.json({ 
    success: true,
    data: {
      totalRestaurants: Object.values(statsMap).reduce((a, b) => a + b, 0),
      pendingVerifications: statsMap.pending || 0,
      verifiedRestaurants: statsMap.verified || 0,
      rejectedVerifications: statsMap.rejected || 0
    }
  });
});

export const getRestaurantDetails = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  
  const restaurant = await Restaurant.findById(restaurantId)
    .populate('ownerId', 'name email phone')
    .select('-password');
  
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  
  res.json({ 
    success: true,
    data: restaurant 
  });
});