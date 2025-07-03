import express from 'express';
import path from 'path';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { uploadRestaurantIcon, uploadGovId, uploadStaffImage } from '../middleware/upload/index.js';
import config from '../config/index.js';

const router = express.Router();

// Upload routes
router.post('/upload/restaurant-icon', authenticate, requireRestaurantOwner, uploadRestaurantIcon, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: req.file.path 
  });
});

router.post('/upload/gov-id', authenticate, requireRestaurantOwner, uploadGovId, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    message: 'Document uploaded successfully',
    filename: req.file.filename,
    path: req.file.path 
  });
});

router.post('/upload/staff-image', authenticate, requireRestaurantOwner, uploadStaffImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    message: 'Staff image uploaded successfully',
    filename: req.file.filename,
    path: req.file.path 
  });
});

// File serving routes
router.get('/restaurant-icon/:filename', (req, res) => {
  const filePath = path.join(config.upload.uploadPath, 'icons', req.params.filename);
  res.sendFile(filePath);
});

router.get('/gov-id/:filename', (req, res) => {
  const filePath = path.join(config.upload.uploadPath, 'documents', req.params.filename);
  res.sendFile(filePath);
});

router.get('/staff/:filename', (req, res) => {
  const filePath = path.join(config.upload.uploadPath, 'staff', req.params.filename);
  res.sendFile(filePath);
});

router.get('/profile/:filename', (req, res) => {
  const filePath = path.join(config.upload.uploadPath, 'profiles', req.params.filename);
  res.sendFile(filePath);
});

export default router; 