import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import {
  // Category controllers
  getMenuCategories,
  getFullMenu,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  // Item controllers
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem
} from '../controllers/menuController.js';

const router = express.Router();

// Ensure upload directories exist
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
ensureUploadDir('./uploads/menu/categories');
ensureUploadDir('./uploads/menu/items');

// Multer configuration for category images
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/menu/categories');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `category-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Multer configuration for item images
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/menu/items');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `item-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Upload middleware
const uploadCategoryImage = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
}).single('image');

const uploadItemImage = multer({
  storage: itemStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
}).single('image');

// Apply authentication middleware to all routes
router.use(authenticate, requireRestaurantOwner);

/**
 * Menu Category Routes
 */

// GET /api/restaurant/menu/categories - Get all categories
router.get('/categories', getMenuCategories);

// GET /api/restaurant/menu/full - Get full menu with categories and items
router.get('/full', getFullMenu);

// POST /api/restaurant/menu/categories - Create new category
router.post('/categories', uploadCategoryImage, createCategory);

// PUT /api/restaurant/menu/categories/:id - Update category
router.put('/categories/:id', uploadCategoryImage, updateCategory);

// PATCH /api/restaurant/menu/categories/:id/toggle - Toggle category status
router.patch('/categories/:id/toggle', toggleCategoryStatus);

// DELETE /api/restaurant/menu/categories/:id - Delete category
router.delete('/categories/:id', deleteCategory);

/**
 * Menu Item Routes
 */

// GET /api/restaurant/menu/categories/:categoryId/items - Get items for a category
router.get('/categories/:categoryId/items', getMenuItems);

// POST /api/restaurant/menu/categories/:categoryId/items - Create new item
router.post('/categories/:categoryId/items', uploadItemImage, createMenuItem);

// PUT /api/restaurant/menu/items/:id - Update item
router.put('/items/:id', uploadItemImage, updateMenuItem);

// PATCH /api/restaurant/menu/items/:id/toggle - Toggle item availability
router.patch('/items/:id/toggle', toggleItemAvailability);

// DELETE /api/restaurant/menu/items/:id - Delete item
router.delete('/items/:id', deleteMenuItem);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed (jpeg, jpg, png, gif, webp)') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

export default router; 