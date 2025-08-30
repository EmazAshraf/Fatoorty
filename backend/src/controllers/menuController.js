import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import { Restaurant } from '../../models/index.js';
import * as menuService from '../services/menuService.js';
import s3Config from '../config/s3.js';

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
    
    // Generate PUBLIC URLs for all categories with images
    for (const category of categories) {
      if (category.image) {
        category.image = s3Config.getFileUrl(category.image);
      }
    }
    
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
    
    // Generate PUBLIC URLs for all categories and items with images
    for (const category of menu) {
      if (category.image) {
        category.image = s3Config.getFileUrl(category.image);
      }
      if (category.items) {
        for (const item of category.items) {
          if (item.image) {
            item.image = s3Config.getFileUrl(item.image);
          }
        }
      }
    }
    
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
    
    let imageKey = undefined;
    
    // Upload image to S3 if provided
    if (req.file) {
      try {
        const uploadResult = await s3Config.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'menu/categories',
          req.file.mimetype,
          true // PUBLIC: Category images should be publicly accessible
        );
        // Store the S3 key for future cleanup
        imageKey = uploadResult.key;
      } catch (uploadError) {
        console.error('S3 upload error:', uploadError);
        return res.status(500).json(createErrorResponse('Failed to upload image', 500));
      }
    }
    
    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
      displayOrder: displayOrder || 0,
      image: imageKey
    };
    
    const category = await menuService.createCategory(restaurantId, categoryData);
    
    // Generate PUBLIC URL for response
    if (category.image) {
      category.image = s3Config.getFileUrl(category.image);
    }
    
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
    
    // Get current category to check for existing image
    const currentCategory = await menuService.getCategoryById(id, restaurantId);
    if (!currentCategory) {
      return res.status(404).json(createErrorResponse('Category not found', 404));
    }
    
    let imageKey = undefined;
    let oldImageKey = currentCategory.image; // Direct key from database
    
    // Upload image to S3 if provided
    if (req.file) {
      try {
        const uploadResult = await s3Config.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'menu/categories',
          req.file.mimetype,
          true // PUBLIC: Category images should be publicly accessible
        );
        // Store the S3 key for future cleanup
        imageKey = uploadResult.key;
      } catch (uploadError) {
        console.error('S3 upload error:', uploadError);
        return res.status(500).json(createErrorResponse('Failed to upload image', 500));
      }
    }
    
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
      ...(imageKey && { image: imageKey })
    };
    
    const category = await menuService.updateCategory(id, restaurantId, updateData);
    
    // Delete old image from S3 if new image was uploaded
    if (req.file && oldImageKey) {
      try {
        await s3Config.deleteFile(oldImageKey);
        console.log(`Deleted old category image: ${oldImageKey}`);
      } catch (deleteError) {
        console.error('Failed to delete old category image:', deleteError);
        // Don't fail the request if image deletion fails
      }
    }
    
    // Generate PUBLIC URL for response
    if (category.image) {
      category.image = s3Config.getFileUrl(category.image);
    }
    
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
    
    // Get category before deletion to extract image key
    const category = await menuService.getCategoryById(id, restaurantId);
    if (!category) {
      return res.status(404).json(createErrorResponse('Category not found', 404));
    }
    
    // Get image key directly from database
    const imageKey = category.image;
    
    await menuService.deleteCategory(id, restaurantId);
    
    // Delete image from S3 if it exists
    if (imageKey) {
      try {
        await s3Config.deleteFile(imageKey);
        console.log(`Deleted category image: ${imageKey}`);
      } catch (deleteError) {
        console.error('Failed to delete category image:', deleteError);
        // Don't fail the request if image deletion fails
      }
    }
    
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
    
    // Generate PUBLIC URLs for all items with images
    for (const item of items) {
      if (item.image) {
        item.image = s3Config.getFileUrl(item.image);
      }
    }
    
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
      ingredients,
      basePrice,
      hasOptions,
      optionGroups,
      addOns,
      prepTime, 
      displayOrder 
    } = req.body;
    
    // Parse and convert data types
    const parsedBasePrice = basePrice !== undefined ? parseFloat(basePrice) : undefined;
    const parsedHasOptions = hasOptions === 'true' || hasOptions === true;
    
    // Handle optionGroups - could be array, string, or object
    let parsedOptionGroups = [];
    if (optionGroups) {
      if (Array.isArray(optionGroups)) {
        parsedOptionGroups = optionGroups;
      } else if (typeof optionGroups === 'string') {
        // Special handling for "[object Object]" case
        if (optionGroups === '[object Object]') {
          return res.status(400).json(createErrorResponse('Frontend data serialization error: optionGroups object not properly converted to JSON. Please check frontend FormData handling.', 400));
        }
        
        try {
          parsedOptionGroups = JSON.parse(optionGroups);
        } catch (e) {
          return res.status(400).json(createErrorResponse('Invalid optionGroups format', 400));
        }
      } else if (typeof optionGroups === 'object') {
        // If it's already an object, convert to array if needed
        parsedOptionGroups = Array.isArray(optionGroups) ? optionGroups : [optionGroups];
      }
    }
    
    // Handle addOns - could be array, string, or object
    let parsedAddOns = [];
    if (addOns) {
      if (Array.isArray(addOns)) {
        parsedAddOns = addOns;
      } else if (typeof addOns === 'string') {
        // Special handling for "[object Object]" case
        if (addOns === '[object Object]') {
          return res.status(400).json(createErrorResponse('Frontend data serialization error: addOns object not properly converted to JSON. Please check frontend FormData handling.', 400));
        }
        
        try {
          parsedAddOns = JSON.parse(addOns);
        } catch (e) {
          return res.status(400).json(createErrorResponse('Invalid addOns format', 400));
        }
      } else if (typeof addOns === 'object') {
        parsedAddOns = Array.isArray(addOns) ? addOns : [addOns];
      }
    }
    
    const parsedPrepTime = prepTime ? parseInt(prepTime) : undefined;
    const parsedDisplayOrder = displayOrder ? parseInt(displayOrder) : undefined;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json(createErrorResponse('Item name must be at least 2 characters', 400));
    }
    
    if (name.length > 80) {
      return res.status(400).json(createErrorResponse('Item name cannot exceed 80 characters', 400));
    }
    
    if (description && description.length > 300) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 300 characters', 400));
    }
    
    if (prepTime && (prepTime < 1 || prepTime > 240)) {
      return res.status(400).json(createErrorResponse('Prep time must be between 1-240 minutes', 400));
    }

    // Validate base price logic based on the hasOptions flag
    if (!parsedHasOptions && (!parsedBasePrice || parsedBasePrice <= 0)) {
      return res.status(400).json(createErrorResponse('Base price is required when no options are configured', 400));
    }

    if (parsedHasOptions && parsedBasePrice && parsedBasePrice > 0) {
      return res.status(400).json(createErrorResponse('Base price should not be set when options are configured', 400));
    }

    // Validate option groups if hasOptions is true
    if (parsedHasOptions) {
      if (!parsedOptionGroups || parsedOptionGroups.length === 0) {
        return res.status(400).json(createErrorResponse('Option groups are required when options are enabled', 400));
      }

      // Validate each option group
      for (const group of parsedOptionGroups) {
        if (!group.name || !group.options || group.options.length === 0) {
          return res.status(400).json(createErrorResponse(`Option group "${group.name}" must have a name and at least one option`, 400));
        }



        // Validate each option in the group
        for (const option of group.options) {
          if (!option.name || option.price === undefined || option.price < 0) {
            return res.status(400).json(createErrorResponse(`Option in group "${group.name}" must have a name and valid price`, 400));
          }
        }
      }
    }

    // Validate add-ons if provided (CREATE)
    if (parsedAddOns && parsedAddOns.length > 0) {
      for (const addon of parsedAddOns) {
        if (!addon.name || addon.price === undefined || addon.price < 0) {
          return res.status(400).json(createErrorResponse('All add-ons must have a name and valid price', 400));
        }
      }
    }

    // Validate ingredients if provided (CREATE)
    if (ingredients) {
      // Handle ingredients - could be string or array
      let parsedIngredients = [];
      if (Array.isArray(ingredients)) {
        parsedIngredients = ingredients;
      } else if (typeof ingredients === 'string') {
        // Check if it's already a JSON string that needs parsing
        if (ingredients.startsWith('[') && ingredients.endsWith(']')) {
          try {
            parsedIngredients = JSON.parse(ingredients);
          } catch (e) {
            // If JSON parsing fails, fall back to comma splitting
            parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
          }
        } else {
          // Regular comma-separated string
          parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
        }
      }
      
      if (parsedIngredients.length > 0) {
        for (const ingredient of parsedIngredients) {
          if (!ingredient || ingredient.trim().length === 0) {
            return res.status(400).json(createErrorResponse('All ingredients must have valid names', 400));
          }
        }
      }
    }
    
    let imageKey = undefined;
    
    // Upload image to S3 if provided (PUBLIC ACCESS)
    if (req.file) {
      try {
        const uploadResult = await s3Config.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'menu/items',
          req.file.mimetype,
          true // PUBLIC: Menu images should be publicly accessible
        );
        // Store the S3 key for future cleanup
        imageKey = uploadResult.key;
      } catch (uploadError) {
        console.error('S3 upload error:', uploadError);
        return res.status(500).json(createErrorResponse('Failed to upload image', 500));
      }
    }
    
    // Parse ingredients for database storage
    let parsedIngredientsForDB = [];
    if (ingredients) {
      if (Array.isArray(ingredients)) {
        parsedIngredientsForDB = ingredients;
      } else if (typeof ingredients === 'string') {
        // Check if it's already a JSON string that needs parsing
        if (ingredients.startsWith('[') && ingredients.endsWith(']')) {
          try {
            parsedIngredientsForDB = JSON.parse(ingredients);
          } catch (e) {
            // If JSON parsing fails, fall back to comma splitting
            parsedIngredientsForDB = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
          }
        } else {
          // Regular comma-separated string
          parsedIngredientsForDB = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
        }
      }
    }
    
    const itemData = {
      name: name.trim(),
      description: description?.trim(),
      ingredients: parsedIngredientsForDB,
      basePrice: parsedHasOptions ? undefined : parsedBasePrice,
      hasOptions: parsedHasOptions || false,
      optionGroups: parsedOptionGroups || [],
      addOns: parsedAddOns || [],
      prepTime: parsedPrepTime,
      displayOrder: parsedDisplayOrder || 0,
      image: imageKey
    };
    
      const item = await menuService.createMenuItem(categoryId, restaurantId, itemData);
    
    // Generate public URL for response (menu images are public)
    if (item.image) {
      item.image = s3Config.getFileUrl(item.image);
    }
    
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
      ingredients,
      basePrice, 
      hasOptions,
      optionGroups,
      addOns,
      prepTime, 
      displayOrder,
      isAvailable 
    } = req.body;
    
    // Validation
    if (name && (name.trim().length < 2 || name.length > 80)) {
      return res.status(400).json(createErrorResponse('Item name must be 2-80 characters', 400));
    }
    
    if (basePrice !== undefined && (basePrice < 0 || basePrice > 99999)) {
      return res.status(400).json(createErrorResponse('Base price must be between 0-99,999', 400));
    }
    
    if (description && description.length > 300) {
      return res.status(400).json(createErrorResponse('Description cannot exceed 300 characters', 400));
    }
    
    if (prepTime && (prepTime < 1 || prepTime > 240)) {
      return res.status(400).json(createErrorResponse('Prep time must be between 1-240 minutes', 400));
    }
    
         // Parse and convert data types for update
     const parsedBasePrice = basePrice !== undefined ? parseFloat(basePrice) : undefined;
     const parsedHasOptions = hasOptions !== undefined ? (hasOptions === 'true' || hasOptions === true) : undefined;
     
     // Handle optionGroups - could be array, string, or object
     let parsedOptionGroups = [];
     if (optionGroups) {
       if (Array.isArray(optionGroups)) {
         parsedOptionGroups = optionGroups;
       } else if (typeof optionGroups === 'string') {
         try {
           parsedOptionGroups = JSON.parse(optionGroups);
         } catch (e) {
           console.error('Failed to parse optionGroups JSON:', e);
           return res.status(400).json(createErrorResponse('Invalid optionGroups format', 400));
         }
       } else if (typeof optionGroups === 'object') {
         // If it's already an object, convert to array if needed
         parsedOptionGroups = Array.isArray(optionGroups) ? optionGroups : [optionGroups];
       }
     }
     
     // Handle addOns - could be array, string, or object
     let parsedAddOns = [];
     if (addOns) {
       if (Array.isArray(addOns)) {
         parsedAddOns = addOns;
       } else if (typeof addOns === 'string') {
         try {
           parsedAddOns = JSON.parse(addOns);
         } catch (e) {
           console.error('Failed to parse addOns JSON:', e);
           return res.status(400).json(createErrorResponse('Invalid addOns format', 400));
         }
       } else if (typeof addOns === 'object') {
         parsedAddOns = Array.isArray(addOns) ? addOns : [addOns];
       }
     }
     
           const parsedPrepTime = prepTime ? parseInt(prepTime) : undefined;
      const parsedDisplayOrder = displayOrder ? parseInt(displayOrder) : undefined;
      
      // Parse ingredients for update
      let parsedIngredients = [];
      if (ingredients) {
        if (Array.isArray(ingredients)) {
          parsedIngredients = ingredients;
        } else if (typeof ingredients === 'string') {
          // Check if it's already a JSON string that needs parsing
          if (ingredients.startsWith('[') && ingredients.endsWith(']')) {
            try {
              parsedIngredients = JSON.parse(ingredients);
            } catch (e) {
              // If JSON parsing fails, fall back to comma splitting
              parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
            }
          } else {
            // Regular comma-separated string
            parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
          }
        }
      }
    
    // Validate base price logic if provided
    if (parsedHasOptions !== undefined && parsedBasePrice !== undefined) {
      if (parsedHasOptions && parsedBasePrice > 0) {
        return res.status(400).json(createErrorResponse('Base price should not be set when options are enabled', 400));
      }
      if (!parsedHasOptions && (!parsedBasePrice || parsedBasePrice <= 0)) {
        return res.status(400).json(createErrorResponse('Base price is required when no options are configured', 400));
      }
    }

    // Validate option groups if hasOptions is true
    if (parsedHasOptions) {
      if (!parsedOptionGroups || parsedOptionGroups.length === 0) {
        return res.status(400).json(createErrorResponse('Option groups are required when options are enabled', 400));
      }

      // Validate each option group
      for (const group of parsedOptionGroups) {
        if (!group.name || !group.options || group.options.length === 0) {
          return res.status(400).json(createErrorResponse(`Option group "${group.name}" must have a name and at least one option`, 400));
        }



        // Validate each option in the group
        for (const option of group.options) {
          if (!option.name || option.price === undefined || option.price < 0) {
            return res.status(400).json(createErrorResponse(`Option in group "${group.name}" must have a name and valid price`, 400));
          }
        }
      }
    }

    // Validate add-ons if provided (UPDATE)
    if (parsedAddOns && parsedAddOns.length > 0) {
      for (const addon of parsedAddOns) {
        if (!addon.name || addon.price === undefined || addon.price < 0) {
          return res.status(400).json(createErrorResponse('All add-ons must have a name and valid price', 400));
        }
      }
    }

    // Validate ingredients if provided (UPDATE)
    if (parsedIngredients && parsedIngredients.length > 0) {
      for (const ingredient of parsedIngredients) {
        if (!ingredient || ingredient.trim().length === 0) {
          return res.status(400).json(createErrorResponse('All ingredients must have valid names', 400));
        }
      }
    }
    
    // Get current item to check for existing image
    const currentItem = await menuService.getItemById(id, restaurantId);
    if (!currentItem) {
      return res.status(404).json(createErrorResponse('Menu item not found', 404));
    }
    
    let imageKey = undefined;
    let oldImageKey = currentItem.image; // Direct key from database
    
    // Upload image to S3 if provided (PUBLIC ACCESS)
    if (req.file) {
      try {
        const uploadResult = await s3Config.uploadFile(
          req.file.buffer,
          req.file.originalname,
          'menu/items',
          req.file.mimetype,
          true // PUBLIC: Menu images should be publicly accessible
        );
        // Store the S3 key for future cleanup
        imageKey = uploadResult.key;
      } catch (uploadError) {
        console.error('S3 upload error:', uploadError);
        return res.status(500).json(createErrorResponse('Failed to upload image', 500));
      }
    }
    
    const updateData = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(parsedIngredients !== undefined && { ingredients: parsedIngredients }),
      ...(parsedBasePrice !== undefined && { basePrice: parsedBasePrice }),
      ...(parsedHasOptions !== undefined && { hasOptions: parsedHasOptions }),
      ...(parsedOptionGroups !== undefined && { optionGroups: parsedOptionGroups }),
      ...(parsedAddOns !== undefined && { addOns: parsedAddOns }),
      ...(parsedPrepTime !== undefined && { prepTime: parsedPrepTime }),
      ...(parsedDisplayOrder !== undefined && { displayOrder: parsedDisplayOrder }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(imageKey && { image: imageKey })
    };
    
    const item = await menuService.updateMenuItem(id, restaurantId, updateData);
    
    // Delete old image from S3 if new image was uploaded
    if (req.file && oldImageKey) {
      try {
        await s3Config.deleteFile(oldImageKey);
        console.log(`Deleted old menu item image: ${oldImageKey}`);
      } catch (deleteError) {
        console.error('Failed to delete old menu item image:', deleteError);
        // Don't fail the request if image deletion fails
      }
    }
    
    // Generate public URL for response (menu images are public)
    if (item.image) {
      item.image = s3Config.getFileUrl(item.image);
    }
    
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
    
    // Get item before deletion to extract image key
    const item = await menuService.getItemById(id, restaurantId);
    if (!item) {
      return res.status(404).json(createErrorResponse('Menu item not found', 404));
    }
    
    // Get image key directly from database
    const imageKey = item.image;
    
    await menuService.deleteMenuItem(id, restaurantId);
    
    // Delete image from S3 if it exists
    if (imageKey) {
      try {
        await s3Config.deleteFile(imageKey);
        console.log(`Deleted menu item image: ${imageKey}`);
      } catch (deleteError) {
        console.error('Failed to delete menu item image:', deleteError);
        // Don't fail the request if image deletion fails
      }
    }
    
    res.json(createSuccessResponse(
      'Menu item deleted successfully'
    ));
  } catch (error) {
    res.status(400).json(createErrorResponse(error.message, 400));
  }
}); 