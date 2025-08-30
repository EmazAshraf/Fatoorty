import s3Config from '../config/s3.js';
import { ValidationError } from '../middleware/error/errorHandler.js';

  /**
   * File Upload Service
   * Handles file validation and S3 uploads
   * 
   * PERFECT ACCESS STRATEGY:
   * - ALL IMAGES: Always public (bucket policy) - direct access
   * - GOVERNMENT IDs: Always private (signed URLs only)
   * - STAFF DOCUMENTS: Always private (signed URLs only)
   * 
   * Note: ACLs disabled on bucket, using bucket policies instead
   */
class FileUploadService {
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    this.allowedDocumentTypes = ['application/pdf'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
  }

  /**
   * Validate file
   * @param {Object} file - Multer file object
   * @param {string[]} allowedTypes - Allowed MIME types
   * @returns {boolean}
   */
  validateFile(file, allowedTypes) {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new ValidationError(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  /**
   * Upload image to S3 (ALWAYS PUBLIC - direct access)
   * @param {Object} file - Multer file object
   * @param {string} folder - S3 folder path
   * @param {boolean} isPublic - Ignored, ALL images are always public
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadImage(file, folder = 'images', isPublic = false) {
    console.log('🖼️ FileUploadService.uploadImage called:', {
      folder,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      note: 'ALL IMAGES are always public (bucket policy) - direct access'
    });

    this.validateFile(file, this.allowedImageTypes);
    console.log('✅ File validation passed');
    
    try {
      console.log('🚀 Calling s3Config.uploadFile with isPublic=true...');
      // ALL IMAGES are ALWAYS public - direct access, no signed URLs needed
      const result = await s3Config.uploadFile(
        file.buffer,
        file.originalname,
        folder,
        file.mimetype,
        true // Force public for ALL images
      );
      
      console.log('✅ S3 upload completed (public - direct access):', result);
      return result;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload document to S3 (ALWAYS PRIVATE - signed URLs only)
   * @param {Object} file - Multer file object
   * @param {string} folder - S3 folder path
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadDocument(file, folder = 'documents') {
    console.log('📄 FileUploadService.uploadDocument called:', {
      folder,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      note: 'Government IDs & Staff docs are ALWAYS private - signed URLs only'
    });

    this.validateFile(file, this.allowedDocumentTypes);
    console.log('✅ Document validation passed');
    
    try {
      console.log('🚀 Calling s3Config.uploadFile with isPublic=false...');
      const result = await s3Config.uploadFile(
        file.buffer,
        file.originalname,
        folder,
        file.mimetype,
        false // Government IDs & Staff docs are ALWAYS private
      );
      
      console.log('✅ Document upload completed (private - signed URLs only):', result);
      return result;
    } catch (error) {
      console.error('❌ Document upload error:', error);
      console.error('Error stack:', error.stack);
      throw new Error('Document upload failed');
    }
  }

  /**
   * Upload restaurant verification files
   * @param {Object} document - Government ID file (PRIVATE - signed URLs only)
   * @param {Object} icon - Restaurant icon file (PUBLIC - direct access)
   * @returns {Promise<{verificationGovIdUrl: string, logoUrl: string}>}
   */
  async uploadRestaurantVerificationFiles(document, icon = null) {
    const results = {};

    try {
      // Upload government ID (ALWAYS PRIVATE - signed URLs only)
      if (document) {
        console.log('📄 Uploading government ID (PRIVATE - signed URLs only)...');
        const govIdResult = await this.uploadDocument(
          document,
          'verifications' // Matches S3 folder structure
        );
        results.verificationGovIdUrl = govIdResult.url;
        console.log('✅ Government ID uploaded (PRIVATE - signed URLs only):', govIdResult.url);
      }

      // Upload restaurant icon (ALWAYS PUBLIC - direct access)
      if (icon) {
        console.log('🖼️ Uploading restaurant icon (PUBLIC - direct access)...');
        const iconResult = await this.uploadImage(
          icon,
          'restaurants/icons'
          // isPublic parameter ignored - ALL images are always public
        );
        results.logoUrl = iconResult.url;
        console.log('✅ Restaurant icon uploaded (PUBLIC - direct access):', iconResult.url);
      }

      return results;
    } catch (error) {
      console.error('❌ Error in uploadRestaurantVerificationFiles:', error);
      // Clean up uploaded files if any error occurs
      if (results.verificationGovIdUrl) {
        const key = s3Config.getKeyFromUrl(results.verificationGovIdUrl);
        if (key) await s3Config.deleteFile(key);
      }
      if (results.logoUrl) {
        const key = s3Config.getKeyFromUrl(results.logoUrl);
        if (key) await s3Config.deleteFile(key);
      }
      throw error;
    }
  }

  /**
   * Upload menu category image (public)
   * @param {Object} file - Image file
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadMenuCategoryImage(file) {
    return this.uploadImage(file, 'menu/categories', true);
  }

  /**
   * Upload menu item image (public)
   * @param {Object} file - Image file
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadMenuItemImage(file) {
    return this.uploadImage(file, 'menu/items', true);
  }

  /**
   * Upload staff profile image (PUBLIC - direct access)
   * @param {Object} file - Image file
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadStaffProfile(file) {
    return this.uploadImage(file, 'staff/profiles'); // ALL images are public
  }

  /**
   * Upload staff document (PRIVATE - signed URLs only)
   * @param {Object} file - Document file
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadStaffDocument(file) {
    return this.uploadDocument(file, 'staff/documents'); // Government IDs are private
  }

  /**
   * Delete file from S3
   * @param {string} fileUrl - S3 file URL
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    
    try {
      const key = s3Config.getKeyFromUrl(fileUrl);
      if (key) {
        await s3Config.deleteFile(key);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Get file URL from key
   * @param {string} key - S3 object key
   * @returns {string} Full S3 URL
   */
  getFileUrl(key) {
    return s3Config.getFileUrl(key);
  }
}

export default new FileUploadService(); 