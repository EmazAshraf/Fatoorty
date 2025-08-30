import express from 'express';
import { authenticate } from '../middleware/auth/index.js';
import s3Config from '../config/s3.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';

const router = express.Router();

/**
 * Generate signed URL for PRIVATE files only (Government IDs & Staff Documents)
 * POST /api/files/signed-url
 * Body: { url: string, type: string, expiresIn?: number }
 * 
 * PERFECT ACCESS STRATEGY:
 * - ALL IMAGES: Always public (direct access)
 * - GOVERNMENT IDs: Always private (signed URLs only)
 * - STAFF DOCUMENTS: Always private (signed URLs only)
 */
router.post('/signed-url', authenticate, async (req, res) => {
  try {
    const { url, type, expiresIn = 300 } = req.body;
    
    if (!url) {
      return res.status(400).json(createErrorResponse('File URL is required', 400));
    }

    if (!type) {
      return res.status(400).json(createErrorResponse('File type is required', 400));
    }

    // Validate file type for private files only (Government IDs & Staff Documents)
    const validPrivateTypes = ['gov-id', 'staff-document'];
    if (!validPrivateTypes.includes(type)) {
      return res.status(400).json(createErrorResponse('Invalid file type for signed URL. Only government IDs and staff documents need signed URLs. Staff profile images are public.', 400));
    }

    // Validate that the URL is from our S3 bucket
    const expectedBaseUrl = s3Config.baseUrl;
    if (!url.includes(expectedBaseUrl)) {
      return res.status(400).json(createErrorResponse('Invalid file URL', 400, {
        expected: expectedBaseUrl,
        received: url
      }));
    }

    // Check if file is actually private (the S3Config will validate this)
    const signedUrl = await s3Config.getSignedUrlFromUrl(url, parseInt(expiresIn));
    
    res.json(createSuccessResponse('Signed URL generated successfully', {
      signedUrl,
      expiresIn: parseInt(expiresIn),
      type
    }));
  } catch (error) {
    console.error('Signed URL generation error:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to generate signed URL';
    let statusCode = 500;
    
    if (error.message.includes('Public files do not need signed URLs')) {
      errorMessage = 'This file is publicly accessible and does not require a signed URL';
      statusCode = 400;
    } else if (error.message.includes('Invalid S3 URL')) {
      errorMessage = 'Invalid file URL provided';
      statusCode = 400;
    } else if (error.message.includes('AccessDenied')) {
      errorMessage = 'Access denied to this file';
      statusCode = 403;
    } else if (error.message.includes('NoSuchKey')) {
      errorMessage = 'File not found';
      statusCode = 404;
    } else if (error.message.includes('TokenRefreshRequired')) {
      errorMessage = 'Authentication token expired. Please refresh and try again.';
      statusCode = 401;
    }
    
    res.status(statusCode).json(createErrorResponse(errorMessage, statusCode));
  }
});



export default router;