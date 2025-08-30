import RestaurantOwner from '../../models/RestaurantOwner.js';
import Restaurant from '../../models/Restaurant.js';
import { generateAccessToken, generateRefreshToken } from './authService.js';
import { generateSecureToken } from '../utils/crypto.js';
import fileUploadService from './fileUploadService.js';
import bcrypt from 'bcryptjs';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';

/**
 * Comprehensive Restaurant Service
 * Handles all restaurant operations with security and validation
 */
class RestaurantService {
  /**
   * Create complete restaurant account with validation
   * @param {Object} data - Signup data
   * @param {Object} files - Uploaded files
   * @returns {Promise<Object>} Created account data
   */
  async createRestaurantAccount(data, files) {
    let uploadedFiles = {};
    
    try {
      const { 
        ownerName, 
        email, 
        password, 
        phone, 
        restaurantName, 
        restaurantType, 
        address 
      } = data;

      // Step 1: Comprehensive validation BEFORE any database or file operations
      if (!ownerName?.trim() || !email?.trim() || !password?.trim() || 
          !phone?.trim() || !restaurantName?.trim() || !restaurantType?.trim() || 
          !address?.trim()) {
        throw new Error('All required fields must be provided');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Password strength validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one number');
      }
      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
        throw new Error('Password must contain at least one special character');
      }

      // Phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }

      // Step 2: Check for existing records BEFORE any operations
      const existingOwner = await RestaurantOwner.findOne({ email: email.toLowerCase() });
      if (existingOwner) {
        throw new Error('An account with this email already exists');
      }

      const existingRestaurant = await Restaurant.findOne({ 
        name: { $regex: new RegExp(`^${restaurantName}$`, 'i') } 
      });
      if (existingRestaurant) {
        throw new Error('A restaurant with this name already exists');
      }

      // Step 3: Validate files BEFORE upload
      if (files) {
          if (files.document?.[0]) {
            const govIdFile = files.document[0];
            if (!govIdFile.mimetype.includes('pdf')) {
              throw new Error('Government ID must be a PDF file');
            }
          if (govIdFile.size > 5 * 1024 * 1024) {
              throw new Error('Government ID file size must be less than 5MB');
            }
          }

          if (files.icon?.[0]) {
            const iconFile = files.icon[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(iconFile.mimetype)) {
              throw new Error('Restaurant icon must be a valid image file (JPEG, PNG, GIF, WebP)');
            }
          if (iconFile.size > 5 * 1024 * 1024) {
              throw new Error('Restaurant icon file size must be less than 5MB');
          }
            }
          }

      // Step 4: Upload files to S3 (only after all validation passes)
      if (files) {
        try {
          uploadedFiles = await fileUploadService.uploadRestaurantVerificationFiles(
            files.document?.[0],
            files.icon?.[0]
          );
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error(uploadError.message || 'File upload failed');
        }
      }

      // Step 5: Create database records (both owner and restaurant in one transaction)
      const session = await RestaurantOwner.db.startSession();
      let owner, restaurant;

      try {
        await session.withTransaction(async () => {
          // Create restaurant owner
          owner = new RestaurantOwner({
        name: ownerName.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        phone: phone.trim()
      });

          await owner.save({ session });

      // Create restaurant record
          restaurant = new Restaurant({
        ownerId: owner._id,
        name: restaurantName.trim(),
        type: restaurantType.trim(),
        address: address.trim(),
            verificationGovIdUrl: uploadedFiles.verificationGovIdUrl || null,
            logo: uploadedFiles.logoUrl || null,
        verificationStatus: 'pending',
        status: 'active'
      });

          await restaurant.save({ session });
        });
      } catch (dbError) {
        // If database operation fails, clean up uploaded files
        if (uploadedFiles.verificationGovIdUrl) {
          try {
            await fileUploadService.deleteFile(uploadedFiles.verificationGovIdUrl);
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded files:', cleanupError);
          }
        }
        if (uploadedFiles.logoUrl) {
          try {
            await fileUploadService.deleteFile(uploadedFiles.logoUrl);
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded files:', cleanupError);
          }
        }
        throw dbError;
      } finally {
        await session.endSession();
      }

      // Step 6: Generate tokens and return success
      const tokenId = generateSecureToken(16);
      const currentTime = Math.floor(Date.now() / 1000);
      
      const payload = {
        id: owner._id,
        email: owner.email,
        role: 'restaurantOwner',
        tokenId,
        iat: currentTime
      };
      
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({ 
        id: owner._id, 
        role: 'restaurantOwner',
        tokenId,
        type: 'refresh'
      });

      return {
        success: true,
        message: 'Restaurant account created successfully',
        data: {
          accessToken,
          refreshToken,
          owner: {
            id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone
          },
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            type: restaurant.type,
            address: restaurant.address,
            verificationStatus: restaurant.verificationStatus,
            status: restaurant.status,
            logo: restaurant.logo
          }
        }
      };

    } catch (error) {
      console.error('Restaurant account creation error:', error);
      throw error;
    }
  }

  /**
   * Authenticate restaurant with comprehensive status check
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateRestaurant(email, password) {

    try {
      // Input validation and sanitization
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      } 

      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      // Prevent NoSQL injection by ensuring email is a string
      if (typeof sanitizedEmail !== 'string' || sanitizedEmail.length > 254) {
        throw new Error('Invalid email format');
      }

      // Prevent password injection attacks
      if (typeof sanitizedPassword !== 'string' || sanitizedPassword.length > 128) {
        throw new Error('Invalid password format');
      }

      // Find owner with email
      const owner = await RestaurantOwner.findOne({ email: sanitizedEmail });
      if (!owner) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await owner.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Get restaurant data
      const restaurant = await Restaurant.findOne({ ownerId: owner._id });
      if (!restaurant) {
        throw new Error('Invalid credentials');
      }

      // Check verification and status
      const { verificationStatus, status } = restaurant;

      // Determine access based on status
      if (verificationStatus === 'verified' && status === 'active') {
        // Grant full access - generate tokens
        const tokenId = generateSecureToken(16);
        const currentTime = Math.floor(Date.now() / 1000);
        
        const payload = {
          id: owner._id,
          email: owner.email,
          role: 'restaurantOwner',
          tokenId,
          iat: currentTime
        };
        
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken({ 
          id: owner._id, 
          role: 'restaurantOwner',
          tokenId,
          type: 'refresh'
        });

        return {
          success: true,
          message: 'Login successful',
          data: {
            accessToken,
            refreshToken,
            owner: {
              id: owner._id,
              name: owner.name,
              email: owner.email,
              phone: owner.phone
            },
            restaurant: {
              id: restaurant._id,
              name: restaurant.name,
              type: restaurant.type,
              address: restaurant.address,
              verificationStatus: restaurant.verificationStatus,
              status: restaurant.status,
              logo: restaurant.logo
            }
          },
          access: {
            status: 'authenticated',
            redirectTo: '/restaurant/dashboard'
          }
        };
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

      return {
        success: false,
        message: message,
        statusCode: 403,
        access: {
          status: statusType,
          verificationStatus,
          accountStatus: status,
          redirectTo,
          restaurant: {
            id: restaurant._id,
            name: restaurant.name
          }
        }
      };

    } catch (error) {
      console.error('Restaurant authentication error:', error);
      throw error;
    }
  }

  /**
   * Get unified restaurant profile with status
   * @param {string} ownerId - Restaurant owner ID
   * @returns {Promise<Object>} Profile data
   */
  async getRestaurantProfile(ownerId) {
    try {
      // Validate owner ID
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }

      // Get owner data
      const owner = await RestaurantOwner.findById(ownerId).select('-password');
      if (!owner) {
        throw new Error('Restaurant owner not found');
      }

      // Get restaurant data
      const restaurant = await Restaurant.findOne({ ownerId });
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Determine access status
      const canAccessDashboard = restaurant.verificationStatus === 'verified' && restaurant.status === 'active';

      // Create access message
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

      return {
        success: true,
        data: {
          owner: {
            id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
          },
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            type: restaurant.type,
            address: restaurant.address,
            logo: restaurant.logo,
            verificationStatus: restaurant.verificationStatus,
            status: restaurant.status,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt
          },
          access: {
            canAccessDashboard,
            message: accessMessage
          }
        }
      };

    } catch (error) {
      console.error('Get restaurant profile error:', error);
      throw error;
    }
  }

  /**
   * Update restaurant profile with comprehensive validation
   * @param {string} ownerId - Restaurant owner ID
   * @param {Object} updates - Update data
   * @param {Object} file - Optional file upload
   * @returns {Promise<Object>} Updated profile
   */
  async updateRestaurantProfile(ownerId, updates, file = null) {
    try {
      console.log('=== RESTAURANT SERVICE UPDATE START ===');
      console.log('Owner ID:', ownerId);
      console.log('Updates:', JSON.stringify(updates, null, 2));
      console.log('File:', file ? {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      // Validate owner ID
      if (!ownerId) {
        console.log('❌ Owner ID missing');
        throw new Error('Owner ID is required');
      }

      console.log('🔍 Finding restaurant owner...');
      // Get existing data
      const owner = await RestaurantOwner.findById(ownerId);
      if (!owner) {
        console.log('❌ Restaurant owner not found');
        throw new Error('Restaurant owner not found');
      }
      console.log('✅ Owner found:', owner.name);

      console.log('🔍 Finding restaurant...');
      const restaurant = await Restaurant.findOne({ ownerId });
      if (!restaurant) {
        console.log('❌ Restaurant not found');
        throw new Error('Restaurant not found');
      }
      console.log('✅ Restaurant found:', restaurant.name);

      // Validate and prepare owner updates
      const ownerUpdates = {};
      if (updates.name) {
        if (updates.name.trim().length < 3) {
          throw new Error('Name must be at least 3 characters long');
        }
        if (updates.name.trim().length > 30) {
          throw new Error('Name cannot exceed 30 characters');
        }
        ownerUpdates.name = updates.name.trim();
      }

      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Invalid email format');
        }
        
        // Check if email is already taken by another user
        const existingOwner = await RestaurantOwner.findOne({ 
          email: updates.email.toLowerCase(), 
          _id: { $ne: ownerId } 
        });
        if (existingOwner) {
          throw new Error('Email is already in use');
        }
        ownerUpdates.email = updates.email.toLowerCase().trim();
      }

      if (updates.phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(updates.phone.replace(/\s/g, ''))) {
          throw new Error('Invalid phone number format');
        }
        ownerUpdates.phone = updates.phone.trim();
      }

      // Validate and prepare restaurant updates
      const restaurantUpdates = {};
      if (updates.restaurantName) {
        if (updates.restaurantName.trim().length < 2) {
          throw new Error('Restaurant name must be at least 2 characters long');
        }
        if (updates.restaurantName.trim().length > 100) {
          throw new Error('Restaurant name cannot exceed 100 characters');
        }
        
        // Check if restaurant name is already taken by another restaurant
        const existingRestaurant = await Restaurant.findOne({ 
          name: { $regex: new RegExp(`^${updates.restaurantName.trim()}$`, 'i') },
          _id: { $ne: restaurant._id }
        });
        if (existingRestaurant) {
          throw new Error('A restaurant with this name already exists');
        }
        restaurantUpdates.name = updates.restaurantName.trim();
      }

      if (updates.restaurantType) {
        if (updates.restaurantType.trim().length < 2) {
          throw new Error('Restaurant type must be at least 2 characters long');
        }
        if (updates.restaurantType.trim().length > 50) {
          throw new Error('Restaurant type cannot exceed 50 characters');
        }
        restaurantUpdates.type = updates.restaurantType.trim();
      }

      if (updates.address) {
        if (updates.address.trim().length < 10) {
          throw new Error('Address must be at least 10 characters long');
        }
        if (updates.address.trim().length > 200) {
          throw new Error('Address cannot exceed 200 characters');
        }
        restaurantUpdates.address = updates.address.trim();
      }

      // Handle file upload if provided
      let logoUrl = null;
      if (file) {
        console.log('📁 Processing file upload:', { 
          name: file.originalname, 
          type: file.mimetype, 
          size: file.size 
        });

        // Validate file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          console.log('❌ Invalid file type:', file.mimetype);
          throw new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP');
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          console.log('❌ File too large:', file.size);
          throw new Error('Image size must be less than 5MB');
        }
        console.log('✅ File validation passed');

        try {
          console.log('🚀 Starting S3 upload to restaurants/icons...');
          // Upload new logo to S3 (always public, isPublic parameter ignored)
          const uploadResult = await fileUploadService.uploadImage(file, 'restaurants/icons');
          console.log('✅ S3 upload successful:', uploadResult);
          logoUrl = uploadResult.url;

          // Delete old logo from S3 if exists
          if (restaurant.logo && restaurant.logo.startsWith('http')) {
            try {
              console.log('🗑️ Deleting old logo:', restaurant.logo);
              await fileUploadService.deleteFile(restaurant.logo);
              console.log('✅ Old logo deleted');
            } catch (err) {
              console.error('⚠️ Failed to delete old logo:', err.message);
            }
          }
        } catch (uploadError) {
          console.error('❌ S3 upload error:', uploadError);
          console.error('Upload error stack:', uploadError.stack);
          throw new Error(uploadError.message || 'Logo upload failed');
        }
      } else {
        console.log('📁 No file provided for upload');
      }

      // Apply updates
      if (Object.keys(ownerUpdates).length > 0) {
        await RestaurantOwner.findByIdAndUpdate(ownerId, ownerUpdates, { new: true });
      }

      if (Object.keys(restaurantUpdates).length > 0 || logoUrl) {
        const finalRestaurantUpdates = { ...restaurantUpdates };
        if (logoUrl) {
          finalRestaurantUpdates.logo = logoUrl;
        }
        await Restaurant.findByIdAndUpdate(restaurant._id, finalRestaurantUpdates, { new: true });
      }

      // Get updated data
      const updatedOwner = await RestaurantOwner.findById(ownerId).select('-password');
      const updatedRestaurant = await Restaurant.findOne({ ownerId });

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          owner: {
            id: updatedOwner._id,
            name: updatedOwner.name,
            email: updatedOwner.email,
            phone: updatedOwner.phone,
            createdAt: updatedOwner.createdAt,
            updatedAt: updatedOwner.updatedAt
          },
          restaurant: {
            id: updatedRestaurant._id,
            name: updatedRestaurant.name,
            type: updatedRestaurant.type,
            address: updatedRestaurant.address,
            logo: updatedRestaurant.logo,
            verificationStatus: updatedRestaurant.verificationStatus,
            status: updatedRestaurant.status,
            createdAt: updatedRestaurant.createdAt,
            updatedAt: updatedRestaurant.updatedAt
          }
        }
      };

    } catch (error) {
      console.error('Update restaurant profile error:', error);
      throw error;
    }
  }

  /**
   * Change restaurant owner password with security validation
   * @param {string} ownerId - Restaurant owner ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success message
   */
  async changeRestaurantPassword(ownerId, currentPassword, newPassword) {
    try {
      // Validate inputs
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }
      if (!currentPassword?.trim()) {
        throw new Error('Current password is required');
      }
      if (!newPassword?.trim()) {
        throw new Error('New password is required');
      }

      // Get owner
      const owner = await RestaurantOwner.findById(ownerId);
      if (!owner) {
        throw new Error('Restaurant owner not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await owner.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(newPassword)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(newPassword)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(newPassword)) {
        throw new Error('Password must contain at least one number');
      }
      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
        throw new Error('Password must contain at least one special character');
      }

      // Check if new password is same as current
      const isNewPasswordSame = await owner.comparePassword(newPassword);
      if (isNewPasswordSame) {
        throw new Error('New password must be different from current password');
      }

      // Update password
      owner.password = newPassword;
      await owner.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new RestaurantService();

