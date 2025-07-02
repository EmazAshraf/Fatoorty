import express from 'express';
import multer from 'multer';
import path from 'path';
import config from '../config/index.js';
import { login, signup } from '../controllers/restaurantOwnerController.js';

// Upload configuration for signup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = config.upload.uploadPath;
    if (file.fieldname === 'restaurantIcon') {
      uploadPath = path.join(uploadPath, 'icons');
    } else if (file.fieldname === 'verificationGovId') {
      uploadPath = path.join(uploadPath, 'documents');
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
  if (file.fieldname === 'restaurantIcon') {
    if (!config.upload.allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid image type'), false);
    }
  } else if (file.fieldname === 'verificationGovId') {
    if (!config.upload.allowedDocumentTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid document type'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

// Make file uploads optional for signup
const uploadSignupFiles = upload.fields([
  { name: 'verificationGovId', maxCount: 1 },
  { name: 'restaurantIcon', maxCount: 1 }
]);

// Middleware wrapper to make uploads optional
const optionalUpload = (req, res, next) => {
  uploadSignupFiles(req, res, (err) => {
    if (err) {
      // Only fail on multer errors, not missing files
      if (err instanceof multer.MulterError || err.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
    }
    next();
  });
};

const router = express.Router();

router.post('/login', login);
// Make uploads truly optional - if no files, handle as JSON
router.post('/signup', (req, res, next) => {
  const contentType = req.headers['content-type'];
  
  // If it's JSON, proceed without upload middleware
  if (contentType && contentType.includes('application/json')) {
    return next();
  }
  
  // If it's FormData, use upload middleware
  optionalUpload(req, res, next);
}, signup);

export default router; 