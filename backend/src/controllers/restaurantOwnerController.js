import { asyncHandler } from '../middleware/error/errorHandler.js';
import { loginRestaurantOwner } from '../services/authService.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';
import Restaurant from '../../models/Restaurant.js';
import { generateToken } from '../services/authService.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(createErrorResponse('Email and password are required', 400));
  }

  try {
    // Authenticate restaurant owner
    const owner = await RestaurantOwner.findOne({ email });
    if (!owner || !(await owner.comparePassword(password))) {
      return res.status(401).json(createErrorResponse('Invalid credentials', 401));
    }

    // Get restaurant data
    const restaurant = await Restaurant.findOne({ ownerId: owner._id });
    if (!restaurant) {
      return res.status(404).json(createErrorResponse('Restaurant not found', 404));
    }

    // Check verification and status
    const { verificationStatus, status } = restaurant;

    // Clear any existing session for suspended accounts
    if (verificationStatus === 'verified' && status === 'suspended') {
      owner.sessionId = null;
      await owner.save();
    }

    // Determine response based on status
    if (verificationStatus === 'verified' && status === 'active') {
      // Grant full access - generate token
      const sessionId = Math.random().toString(36).substring(2, 15);
      owner.sessionId = sessionId;
      await owner.save();
      
      const token = generateToken({ 
        id: owner._id, 
        email: owner.email, 
        sessionId, 
        role: 'restaurantOwner' 
      });

      return res.json(createSuccessResponse(
        'Login successful',
        {
          token,
          owner: {
            id: owner._id,
            name: owner.name,
            email: owner.email,
          },
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            verificationStatus: restaurant.verificationStatus,
            status: restaurant.status
          }
        },
        { 
          status: 'authenticated',
          redirectTo: '/restaurant/dashboard'
        }
      ));
    }

    // Handle different non-accessible states
    let statusType, message, redirectTo;

    if (verificationStatus === 'pending') {
      statusType = 'verification_pending';
      message = 'Your restaurant verification is still pending. Please wait for approval.';
      redirectTo = '/restaurant/verification-pending';
    } else if (verificationStatus === 'rejected') {
      statusType = 'verification_rejected';
      message = 'Your restaurant verification was rejected. Please contact support.';
      redirectTo = '/restaurant/verification-rejected';
    } else if (verificationStatus === 'verified' && status === 'suspended') {
      statusType = 'account_suspended';
      message = 'Your restaurant account is suspended. Please contact support.';
      redirectTo = '/restaurant/account-suspended';
    } else {
      statusType = 'access_denied';
      message = 'Access denied. Please contact support for assistance.';
      redirectTo = '/restaurant/access-denied';
    }

    return res.status(403).json(createErrorResponse(
      message,
      403,
      {
        status: statusType,
        verificationStatus,
        accountStatus: status,
        redirectTo,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        }
      }
    ));

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(createErrorResponse('Login failed. Please try again.', 500));
  }
});

export const signup = asyncHandler(async (req, res) => {
  const { 
    ownerName, 
    email, 
    password, 
    phone, 
    restaurantName, 
    restaurantType, 
    address 
  } = req.body;

  // Validate required fields (files are now optional)
  if (!ownerName || !email || !password || !phone || !restaurantName || !restaurantType || !address) {
    return res.status(400).json({ 
      success: false,
      message: 'All required fields must be provided' 
    });
  }

  // Check if owner already exists
  const existingOwner = await RestaurantOwner.findOne({ email });
  if (existingOwner) {
    return res.status(400).json({ 
      success: false,
      message: 'An account with this email already exists' 
    });
  }

  try {
    // Create restaurant owner
    const owner = new RestaurantOwner({
      name: ownerName,
      email,
      password,
      phone
    });

    const sessionId = Math.random().toString(36).substring(2, 15);
    owner.sessionId = sessionId;
    await owner.save();

    // Create restaurant record with optional files
    const restaurant = new Restaurant({
      ownerId: owner._id,
      name: restaurantName,
      type: restaurantType,
      address,
      verificationGovIdUrl: req.files?.verificationGovId?.[0]?.filename || null,
      logo: req.files?.restaurantIcon?.[0]?.filename || null,
      verificationStatus: 'pending',
      status: 'active'
    });

    await restaurant.save();

    // Generate token
    const token = generateToken({ 
      id: owner._id, 
      email: owner.email, 
      sessionId, 
      role: 'restaurantOwner' 
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant account created successfully',
      data: {
        token,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          verificationStatus: restaurant.verificationStatus,
          status: restaurant.status
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create account. Please try again.' 
    });
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const owner = await RestaurantOwner.findById(req.user._id).select('-password');
  res.json({ owner });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const owner = await RestaurantOwner.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true }
  ).select('-password');
  res.json({ owner });
}); 