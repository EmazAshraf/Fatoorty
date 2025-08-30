import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/index.js';
import { ValidationError } from '../error/errorHandler.js';

// Use memory storage for S3 uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'icon' || file.fieldname === 'image' || file.fieldname === 'profilePhoto') {
    if (!config.upload.allowedImageTypes.includes(file.mimetype)) {
      return cb(new ValidationError('Invalid image type'), false);
    }
  } else if (file.fieldname === 'document' || file.fieldname === 'governmentId') {
    if (!config.upload.allowedDocumentTypes.includes(file.mimetype)) {
      return cb(new ValidationError('Invalid document type'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

// Upload middleware for different file types
export const uploadGovId = upload.single('document');
export const uploadRestaurantIcon = upload.single('icon');
export const uploadStaffImage = upload.single('image');
export const uploadProfilePhoto = upload.single('profilePhoto');
export const uploadStaffPhoto = upload.single('profilePhoto');
export const uploadStaffDocument = upload.single('governmentId');

// Staff upload middleware - handles both profile photo and government ID
export const uploadStaffFiles = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 }
]);

// Restaurant signup middleware - handles both document and icon files
export const uploadRestaurantSignup = upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]); 

export default upload; 