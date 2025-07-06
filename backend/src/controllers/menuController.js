import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import { Restaurant } from '../../models/index.js';
import * as menuService from '../services/menuService.js';

/**
 * Get restaurant ID from authenticated user
 */
const getRestaurantId = async (userId) => {
  const restaurant = await Restaurant.findOne({ ownerId: userId });
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  return restaurant._id;
};

/**
 * Menu Category Controllers
 */

// Get all menu categories
export const getMenuCategories = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const categories = await menuService.getMenuCategories(restaurantId);
    
    res.json(createSuccessResponse(
      'Menu categories retrieved successfully',
      categories
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Get full menu with categories and items
export const getFullMenu = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const menu = await menuService.getFullMenu(restaurantId);
    
    res.json(createSuccessResponse(
      'Full menu retrieved successfully',
      menu
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Create new category
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { name, description, displayOrder } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json(createErrorResponse('Category name must be at least 2 characters', 400));
    }
    
    if (name.length > 50) {
      return res.status(400).json(createErrorResponse('Category name cannot exceed 50 characters', 400));
    }
    
    if (description && description.length > 200) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 200 characters', 400));
    }
    
    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
      displayOrder: displayOrder || 0,
      image: req.file ? `/uploads/menu/categories/${req.file.filename}` : undefined
    };
    
    const category = await menuService.createCategory(restaurantId, categoryData);
    
    res.status(201).json(createSuccessResponse(
      'Menu category created successfully',
      category
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    const { name, description, displayOrder, isActive } = req.body;
    
    // Validation
    if (name && (name.trim().length < 2 || name.length > 50)) {
      return res.status(400).json(createErrorResponse('Category name must be 2-50 characters', 400));
    }
    
    if (description && description.length > 200) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 200 characters', 400));
    }
    
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
      ...(req.file && { image: `/uploads/menu/categories/${req.file.filename}` })
    };
    
    const category = await menuService.updateCategory(id, restaurantId, updateData);
    
    res.json(createSuccessResponse(
      'Menu category updated successfully',
      category
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Toggle category status
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    
    const category = await menuService.toggleCategoryStatus(id, restaurantId);
    
    res.json(createSuccessResponse(
      `Category ${category.isActive ? 'enabled' : 'disabled'} successfully`,
      category
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    
    await menuService.deleteCategory(id, restaurantId);
    
    res.json(createSuccessResponse(
      'Menu category deleted successfully'
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

/**
 * Menu Item Controllers
 */

// Get menu items for a category
export const getMenuItems = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { categoryId } = req.params;
    
    const items = await menuService.getMenuItems(categoryId, restaurantId);
    
    res.json(createSuccessResponse(
      'Menu items retrieved successfully',
      items
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Create new menu item
export const createMenuItem = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { categoryId } = req.params;
    const { 
      name, 
      description, 
      price, 
      prepTime, 
      ingredients, 
      options, 
      displayOrder 
    } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json(createErrorResponse('Item name must be at least 2 characters', 400));
    }
    
    if (name.length > 80) {
      return res.status(400).json(createErrorResponse('Item name cannot exceed 80 characters', 400));
    }
    
    if (!price || price < 0) {
      return res.status(400).json(createErrorResponse('Valid price is required', 400));
    }
    
    if (price > 99999) {
      return res.status(400).json(createErrorResponse('Price cannot exceed 99,999', 400));
    }
    
    if (description && description.length > 300) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 300 characters', 400));
    }
    
    if (prepTime && (prepTime < 1 || prepTime > 240)) {
      return res.status(400).json(createErrorResponse('Prep time must be between 1-240 minutes', 400));
    }
    
    // Parse ingredients if it's a string
    let parsedIngredients = [];
    if (ingredients) {
      try {
        parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        if (!Array.isArray(parsedIngredients)) {
          return res.status(400).json(createErrorResponse('Ingredients must be an array', 400));
        }
        if (parsedIngredients.length > 20) {
          return res.status(400).json(createErrorResponse('Cannot have more than 20 ingredients', 400));
        }
      } catch (error) {
        return res.status(400).json(createErrorResponse('Invalid ingredients format', 400));
      }
    }
    
    // Parse options if it's a string
    let parsedOptions = [];
    if (options) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
        if (!Array.isArray(parsedOptions)) {
          return res.status(400).json(createErrorResponse('Options must be an array', 400));
        }
        if (parsedOptions.length > 5) {
          return res.status(400).json(createErrorResponse('Cannot have more than 5 option groups', 400));
        }
      } catch (error) {
        return res.status(400).json(createErrorResponse('Invalid options format', 400));
      }
    }
    
    const itemData = {
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      ingredients: parsedIngredients,
      options: parsedOptions,
      displayOrder: displayOrder || 0,
      image: req.file ? `/uploads/menu/items/${req.file.filename}` : undefined
    };
    
    const item = await menuService.createMenuItem(categoryId, restaurantId, itemData);
    
    res.status(201).json(createSuccessResponse(
      'Menu item created successfully',
      item
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Update menu item
export const updateMenuItem = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      prepTime, 
      ingredients, 
      options, 
      displayOrder,
      isAvailable 
    } = req.body;
    
    // Validation
    if (name && (name.trim().length < 2 || name.length > 80)) {
      return res.status(400).json(createErrorResponse('Item name must be 2-80 characters', 400));
    }
    
    if (price !== undefined && (price < 0 || price > 99999)) {
      return res.status(400).json(createErrorResponse('Price must be between 0-99,999', 400));
    }
    
    if (description && description.length > 300) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 300 characters', 400));
    }
    
    if (prepTime && (prepTime < 1 || prepTime > 240)) {
      return res.status(400).json(createErrorResponse('Prep time must be between 1-240 minutes', 400));
    }
    
    // Parse ingredients if provided
    let parsedIngredients;
    if (ingredients !== undefined) {
      try {
        parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        if (!Array.isArray(parsedIngredients)) {
          return res.status(400).json(createErrorResponse('Ingredients must be an array', 400));
        }
        if (parsedIngredients.length > 20) {
          return res.status(400).json(createErrorResponse('Cannot have more than 20 ingredients', 400));
        }
      } catch (error) {
        return res.status(400).json(createErrorResponse('Invalid ingredients format', 400));
      }
    }
    
    // Parse options if provided
    let parsedOptions;
    if (options !== undefined) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
        if (!Array.isArray(parsedOptions)) {
          return res.status(400).json(createErrorResponse('Options must be an array', 400));
        }
        if (parsedOptions.length > 5) {
          return res.status(400).json(createErrorResponse('Cannot have more than 5 option groups', 400));
        }
      } catch (error) {
        return res.status(400).json(createErrorResponse('Invalid options format', 400));
      }
    }
    
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(prepTime !== undefined && { prepTime: parseInt(prepTime) }),
      ...(parsedIngredients !== undefined && { ingredients: parsedIngredients }),
      ...(parsedOptions !== undefined && { options: parsedOptions }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(req.file && { image: `/uploads/menu/items/${req.file.filename}` })
    };
    
    const item = await menuService.updateMenuItem(id, restaurantId, updateData);
    
    res.json(createSuccessResponse(
      'Menu item updated successfully',
      item
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Toggle item availability
export const toggleItemAvailability = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    
    const item = await menuService.toggleItemAvailability(id, restaurantId);
    
    res.json(createSuccessResponse(
      `Item ${item.isAvailable ? 'enabled' : 'disabled'} successfully`,
      item
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
});

// Delete menu item
export const deleteMenuItem = asyncHandler(async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req.user._id);
    const { id } = req.params;
    
    await menuService.deleteMenuItem(id, restaurantId);
    
    res.json(createSuccessResponse(
      'Menu item deleted successfully'
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
}); 