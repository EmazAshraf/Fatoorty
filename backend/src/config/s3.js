import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

  /**
   * Professional S3 Configuration
   * Unified AWS SDK v3 with bucket policy-based access control
   * 
   * PERFECT ACCESS STRATEGY:
   * - ALL IMAGES: Public (direct access via bucket policy)
   * - GOVERNMENT IDs: Private (signed URLs only)
   * - STAFF DOCUMENTS: Private (signed URLs only)
   * 
   * Note: ACLs disabled on bucket, using bucket policies instead
   */
class S3Config {
  constructor() {
    // Use only AWS SDK v3 for consistency
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.region = process.env.AWS_REGION || 'eu-north-1';
    this.baseUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
    
    // File access patterns - PERFECT STRATEGY
    this.publicFolders = [
      'menu/categories',      // Menu images - public
      'menu/items',           // Menu images - public
      'restaurants/icons',    // Restaurant logos - public
      'staff/profiles'        // Staff profile images - public
    ];
    
    this.privateFolders = [
      'verifications',         // Government IDs - PRIVATE (signed URLs only)
      'staff/documents'        // Staff government IDs - PRIVATE (signed URLs only)
    ];
  }

  /**
   * Check if a file path/URL is public
   * @param {string} pathOrUrl - File path or full URL
   * @returns {boolean}
   */
  isPublicFile(pathOrUrl) {
    const path = this.extractPathFromUrl(pathOrUrl);
    return this.publicFolders.some(folder => path.startsWith(folder));
  }

  /**
   * Check if a file path/URL is private
   * @param {string} pathOrUrl - File path or full URL
   * @returns {boolean}
   */
  isPrivateFile(pathOrUrl) {
    const path = this.extractPathFromUrl(pathOrUrl);
    return this.privateFolders.some(folder => path.startsWith(folder));
  }

  /**
   * Extract file path from full URL
   * @param {string} urlOrPath - Full URL or just path
   * @returns {string} Clean file path
   */
  extractPathFromUrl(urlOrPath) {
    if (!urlOrPath) return '';
    if (urlOrPath.startsWith('http')) {
      return urlOrPath.replace(`${this.baseUrl}/`, '');
    }
    return urlOrPath;
  }

  /**
   * Upload file to S3 with public/private ACL
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {string} folder - S3 folder path
   * @param {string} contentType - File content type
   * @param {boolean} isPublic - Whether file should be publicly accessible
   * @returns {Promise<{url: string, key: string, isPublic: boolean}>}
   */
  async uploadFile(fileBuffer, fileName, folder = '', contentType = 'application/octet-stream', isPublic = false) {
    try {
      console.log('🌐 S3Config.uploadFile called:', {
        fileName,
        folder,
        contentType,
        isPublic,
        bufferSize: fileBuffer.length,
        bucketName: this.bucketName,
        region: this.region
      });

      // Generate unique file name
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${timestamp}-${randomSuffix}.${fileExtension}`;
      
      console.log('📝 Generated filename:', uniqueFileName);

      const uploadParams = {
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: isPublic ? 'max-age=31536000' : 'no-cache', // Cache public files for 1 year
        // ACL removed: Bucket has ACLs disabled, using bucket policy instead
      };

      console.log('📤 Upload params:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        CacheControl: uploadParams.CacheControl
      });

      console.log('🚀 Sending PutObjectCommand to S3...');
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);
      console.log('✅ S3 upload successful');
      
      const url = `${this.baseUrl}/${uniqueFileName}`;
      console.log('🔗 Generated URL:', url);
      
      const result = {
        url,
        key: uniqueFileName,
        isPublic,
        bucket: this.bucketName
      };
      
      console.log('📋 Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('File deletion failed');
    }
  }

  /**
   * Get file URL from key
   * @param {string} key - S3 object key
   * @returns {string} Full S3 URL
   */
  getFileUrl(key) {
    return `${this.baseUrl}/${key}`;
  }

  /**
   * Extract key from S3 URL
   * @param {string} url - Full S3 URL
   * @returns {string} S3 object key
   */
  getKeyFromUrl(url) {
    if (!url || !url.includes(this.bucketName)) {
      return null;
    }
    return url.replace(`${this.baseUrl}/`, '');
  }

  /**
   * Generate signed URL for PRIVATE files only
   * @param {string} key - S3 object key
   * @param {number} expiresIn - Expiration time in seconds (default: 300 = 5 minutes)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 300) {
    try {
      // Check if this should be a private file
      if (this.isPublicFile(key)) {
        throw new Error('Public files do not need signed URLs. Use direct URL instead.');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Generate signed URL from full S3 URL (PRIVATE files only)
   * @param {string} url - Full S3 URL
   * @param {number} expiresIn - Expiration time in seconds (default: 300)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrlFromUrl(url, expiresIn = 300) {
    const key = this.getKeyFromUrl(url);
    if (!key) {
      throw new Error('Invalid S3 URL');
    }
    
    // Additional check: Only allow signed URLs for private files
    if (this.isPublicFile(key)) {
      throw new Error('Public files do not need signed URLs. Use direct URL instead.');
    }
    
    return this.getSignedUrl(key, expiresIn);
  }
}

export default new S3Config(); 