import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import Staff from '../../models/Staff.js';
import Restaurant from '../../models/Restaurant.js';

/**
 * Get all staff for a restaurant with pagination
 * GET /api/restaurant/staff
 */
export const getAllStaffController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
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

  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  try {
    // Get staff with pagination
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
  const { name, email, phone, position, salary, joiningDate, status = 'active' } = req.body;

  // Get restaurant ID from authenticated user
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  // Validate required fields
  if (!name || !email || !phone || !position || !salary || !joiningDate) {
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
    // Create new staff member
    const staffData = {
      restaurantId: restaurant._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      position: position.toLowerCase(),
      salary: Number(salary),
      joiningDate: new Date(joiningDate),
      status,
      image: null // Always null for now, will add Cloudinary later
    };

    const newStaff = new Staff(staffData);
    await newStaff.save();

    res.status(201).json(createSuccessResponse(
      'Staff member added successfully',
      newStaff
    ));
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json(createErrorResponse('Failed to add staff member', 500))
    ;
  }
});

/**
 * Update staff member
 * PUT /api/restaurant/staff/:id
 */
export const updateStaffController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, position, salary, joiningDate, status } = req.body;

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

    // Update fields
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (position) updateData.position = position;
    if (salary) updateData.salary = Number(salary);
    if (joiningDate) updateData.joiningDate = new Date(joiningDate);
    if (status) updateData.status = status;
    // Image will be handled later with Cloudinary integration

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
    console.error('Error updating staff:', error);
    res.status(500).json(createErrorResponse('Failed to update staff member', 500));
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
          totalSalaryExpense: { $sum: '$salary' },
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
      totalSalaryExpense: stats?.totalSalaryExpense || 0,
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