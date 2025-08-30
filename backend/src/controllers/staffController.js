import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import Staff from '../../models/Staff.js';
import Restaurant from '../../models/Restaurant.js';
import fileUploadService from '../services/fileUploadService.js';

/**
 * Get all staff for a restaurant with pagination and filtering
 * GET /api/restaurant/staff
 */
export const getAllStaffController = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    position = '', 
    status = '', 
    startDate = '', 
    endDate = '',
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;
  
  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  // Build search query
  const searchQuery = {
    restaurantId: restaurant._id,
    isDeleted: false
  };

  // Add search filter
  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } }
    ];
  }

  // Add position filter
  if (position && position !== 'all') {
    searchQuery.position = position;
  }

  // Add status filter
  if (status && status !== 'all') {
    searchQuery.status = status;
  }

  // Add date range filter
  if (startDate || endDate) {
    searchQuery.joiningDate = {};
    if (startDate) {
      searchQuery.joiningDate.$gte = new Date(startDate);
    }
    if (endDate) {
      searchQuery.joiningDate.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  try {
    // Get staff with pagination and filtering
    const [staff, totalCount] = await Promise.all([
      Staff.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Staff.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json(createSuccessResponse(
      'Staff list retrieved successfully',
      staff,
      {
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    ));
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json(createErrorResponse('Failed to fetch staff', 500));
  }
});

/**
 * Add new staff member
 * POST /api/restaurant/staff
 */
export const addStaffController = asyncHandler(async (req, res) => {
  const { name, email, phone, position, joiningDate, status = 'active' } = req.body;

  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  // Validate required fields
  if (!name || !email || !phone || !position || !joiningDate) {
    return res.status(400).json(createErrorResponse('All required fields must be provided', 400));
  }

  // Check if staff with same email already exists in this restaurant
  const existingStaff = await Staff.findOne({ 
    restaurantId: restaurant._id, 
    email: email.toLowerCase(),
    isDeleted: false 
  });

  if (existingStaff) {
    return res.status(400).json(createErrorResponse('Staff member with this email already exists', 400));
  }

  try {
    // Handle file uploads if present
    let profilePhotoUrl = null;
    let governmentIdUrl = null;

    if (req.files) {
      console.log('📁 Files received for creation:', Object.keys(req.files));
      console.log('📁 Files details:', {
        profilePhoto: req.files.profilePhoto ? `${req.files.profilePhoto.length} file(s)` : 'none',
        governmentId: req.files.governmentId ? `${req.files.governmentId.length} file(s)` : 'none'
      });
      
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        console.log('🖼️ Uploading profile photo for staff creation...');
        console.log('Photo details:', {
          name: req.files.profilePhoto[0].originalname,
          size: req.files.profilePhoto[0].size,
          type: req.files.profilePhoto[0].mimetype
        });
        const photoResult = await fileUploadService.uploadStaffProfile(
          req.files.profilePhoto[0]
        );
        profilePhotoUrl = photoResult.url;
        console.log('✅ Profile photo uploaded successfully:', profilePhotoUrl);
      }

      if (req.files.governmentId && req.files.governmentId[0]) {
        console.log('📄 Uploading government ID for staff creation...');
        console.log('Document details:', {
          name: req.files.governmentId[0].originalname,
          size: req.files.governmentId[0].size,
          type: req.files.governmentId[0].mimetype
        });
        const govIdResult = await fileUploadService.uploadStaffDocument(
          req.files.governmentId[0]
        );
        governmentIdUrl = govIdResult.url;
        console.log('✅ Government ID uploaded successfully:', governmentIdUrl);
      }
    } else {
      console.log('📁 No files received in request');
    }

    // Create new staff member
    const staffData = {
      restaurantId: restaurant._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      position: position.toLowerCase(),
      joiningDate: new Date(joiningDate),
      status,
      profilePhoto: profilePhotoUrl,
      governmentIdUrl: governmentIdUrl
    };

    console.log('Creating staff with data:', staffData);
    const newStaff = new Staff(staffData);
    await newStaff.save();
    console.log('Staff created successfully:', newStaff._id);

    res.status(201).json(createSuccessResponse(
      'Staff member added successfully',
      newStaff
    ));
  } catch (error) {
    console.error('❌ Error adding staff:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to add staff member';
    let statusCode = 500;
    
    if (error.message.includes('validation')) {
      errorMessage = 'Validation error: ' + error.message;
      statusCode = 400;
    } else if (error.message.includes('upload') || error.message.includes('S3')) {
      errorMessage = 'File upload failed: ' + error.message;
      statusCode = 500;
    } else if (error.message.includes('duplicate') || error.message.includes('exists')) {
      errorMessage = 'Staff member with this email already exists';
      statusCode = 400;
    }
    
    res.status(statusCode).json(createErrorResponse(errorMessage, statusCode));
  }
});

/**
 * Update staff member
 * PUT /api/restaurant/staff/:id
 */
export const updateStaffController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, position, joiningDate, status } = req.body;

  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  try {
    // Find staff member
    const staff = await Staff.findOne({ 
      _id: id, 
      restaurantId: restaurant._id,
      isDeleted: false 
    });

    if (!staff) {
      return res.status(404).json(createErrorResponse('Staff member not found', 404));
    }

    // Check if email is being changed and if it conflicts with another staff member
    if (email && email.toLowerCase() !== staff.email) {
      const existingStaff = await Staff.findOne({ 
        restaurantId: restaurant._id, 
        email: email.toLowerCase(),
        _id: { $ne: id },
        isDeleted: false 
      });

      if (existingStaff) {
        return res.status(400).json(createErrorResponse('Staff member with this email already exists', 400));
      }
    }

    // Handle file uploads if present
    let profilePhotoUrl = staff.profilePhoto;
    let governmentIdUrl = staff.governmentIdUrl;

    if (req.files) {
      console.log('📁 Files received for update:', Object.keys(req.files));
      console.log('📁 Files details:', {
        profilePhoto: req.files.profilePhoto ? `${req.files.profilePhoto.length} file(s)` : 'none',
        governmentId: req.files.governmentId ? `${req.files.governmentId.length} file(s)` : 'none'
      });

      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        console.log('🖼️ Uploading profile photo for staff update...');
        console.log('Photo details:', {
          name: req.files.profilePhoto[0].originalname,
          size: req.files.profilePhoto[0].size,
          type: req.files.profilePhoto[0].mimetype
        });
        
        // 🔄 FILE REPLACEMENT PROCESS: Delete old file → Upload new file → Update database
        // Delete old profile photo if it exists
        if (staff.profilePhoto) {
          console.log('🗑️ Deleting old profile photo:', staff.profilePhoto);
          try {
            await fileUploadService.deleteFile(staff.profilePhoto);
            console.log('✅ Old profile photo deleted successfully');
          } catch (deleteError) {
            console.warn('⚠️ Warning: Failed to delete old profile photo:', deleteError.message);
            console.warn('⚠️ Old file URL:', staff.profilePhoto);
            console.warn('⚠️ Deletion error details:', deleteError);
            // Don't fail the update if deletion fails - continue with new file upload
          }
        }
        
        const photoResult = await fileUploadService.uploadStaffProfile(
          req.files.profilePhoto[0]
        );
        profilePhotoUrl = photoResult.url;
        console.log('✅ Profile photo uploaded successfully:', profilePhotoUrl);
      }

      if (req.files.governmentId && req.files.governmentId[0]) {
        console.log('📄 Uploading government ID for staff update...');
        console.log('Document details:', {
          name: req.files.governmentId[0].originalname,
          size: req.files.governmentId[0].size,
          type: req.files.governmentId[0].mimetype
        });
        
        // 🔄 FILE REPLACEMENT PROCESS: Delete old file → Upload new file → Update database
        // Delete old government ID if it exists
        if (staff.governmentIdUrl) {
          console.log('🗑️ Deleting old government ID:', staff.governmentIdUrl);
          try {
            await fileUploadService.deleteFile(staff.governmentIdUrl);
            console.log('✅ Old government ID deleted successfully');
          } catch (deleteError) {
            console.warn('⚠️ Warning: Failed to delete old government ID:', deleteError.message);
            console.warn('⚠️ Old file URL:', staff.governmentIdUrl);
            console.warn('⚠️ Deletion error details:', deleteError);
            // Don't fail the update if deletion fails - continue with new file upload
          }
        }
        
        const govIdResult = await fileUploadService.uploadStaffDocument(
          req.files.governmentId[0]
        );
        governmentIdUrl = govIdResult.url;
        console.log('✅ Government ID uploaded successfully:', governmentIdUrl);
      }
    } else {
      console.log('📁 No files received in request');
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (position) updateData.position = position;
    if (joiningDate) updateData.joiningDate = new Date(joiningDate);
    if (status) updateData.status = status;
    if (profilePhotoUrl !== staff.profilePhoto) updateData.profilePhoto = profilePhotoUrl;
    if (governmentIdUrl !== staff.governmentIdUrl) updateData.governmentIdUrl = governmentIdUrl;

    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(createSuccessResponse(
      'Staff member updated successfully',
      updatedStaff
    ));
  } catch (error) {
    console.error('❌ Error updating staff:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update staff member';
    let statusCode = 500;
    
    if (error.message.includes('validation')) {
      errorMessage = 'Validation error: ' + error.message;
      statusCode = 400;
    } else if (error.message.includes('upload') || error.message.includes('S3')) {
      errorMessage = 'File upload failed: ' + error.message;
      statusCode = 500;
    } else if (error.message.includes('not found')) {
      errorMessage = 'Staff member not found';
      statusCode = 404;
    }
    
    res.status(statusCode).json(createErrorResponse(errorMessage, statusCode));
  }
});

/**
 * Delete staff member (soft delete)
 * DELETE /api/restaurant/staff/:id
 */
export const deleteStaffController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  try {
    // Find staff member
    const staff = await Staff.findOne({ 
      _id: id, 
      restaurantId: restaurant._id,
      isDeleted: false 
    });

    if (!staff) {
      return res.status(404).json(createErrorResponse('Staff member not found', 404));
    }

    // Soft delete
    staff.isDeleted = true;
    staff.deletedAt = new Date();
    await staff.save();

    res.json(createSuccessResponse(
      'Staff member deleted successfully',
      { id }
    ));
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json(createErrorResponse('Failed to delete staff member', 500));
  }
});

/**
 * Get staff statistics
 * GET /api/restaurant/staff/stats
 */
export const getStaffStatsController = asyncHandler(async (req, res) => {
  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  try {
    const [stats] = await Staff.aggregate([
      { 
        $match: { 
          restaurantId: restaurant._id,
          isDeleted: false 
        } 
      },
      {
        $group: {
          _id: null,
          totalStaff: { $sum: 1 },
          activeStaff: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
          },
          inactiveStaff: { 
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } 
          },
          positions: { $push: '$position' }
        }
      }
    ]);

    // Calculate position distribution
    const positionDistribution = {};
    if (stats && stats.positions) {
      stats.positions.forEach(position => {
        positionDistribution[position] = (positionDistribution[position] || 0) + 1;
      });
    }

    const result = {
      totalStaff: stats?.totalStaff || 0,
      activeStaff: stats?.activeStaff || 0,
      inactiveStaff: stats?.inactiveStaff || 0,
      positionDistribution: Object.entries(positionDistribution).map(([position, count]) => ({
        position,
        count
      }))
    };

    res.json(createSuccessResponse(
      'Staff statistics retrieved successfully',
      result
    ));
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json(createErrorResponse('Failed to fetch staff statistics', 500));
  }
}); 