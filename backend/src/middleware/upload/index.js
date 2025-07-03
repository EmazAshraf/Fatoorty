import multer from 'multer';
import path from 'path';
import config from '../../config/index.js';
import { ValidationError } from '../error/errorHandler.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = config.upload.uploadPath;
    if (file.fieldname === 'icon') {
      uploadPath = path.join(uploadPath, 'icons');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(uploadPath, 'documents');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(uploadPath, 'staff');
    } else if (file.fieldname === 'profilePhoto') {
      uploadPath = path.join(uploadPath, 'profiles');
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = file.fieldname + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
    cb(null, `${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'icon' || file.fieldname === 'image' || file.fieldname === 'profilePhoto') {
    if (!config.upload.allowedImageTypes.includes(file.mimetype)) {
      return cb(new ValidationError('Invalid image type'), false);
    }
  } else if (file.fieldname === 'document') {
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

export const uploadRestaurantIcon = upload.single('icon');
export const uploadGovId = upload.single('document');
export const uploadStaffImage = upload.single('image');
export const uploadProfilePhoto = upload.single('profilePhoto'); 