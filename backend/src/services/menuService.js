import { MenuCategory, MenuItem } from '../../models/index.js';
import mongoose from 'mongoose';

/**
 * Menu Category Services
 */

// Get all categories for a restaurant
export const getMenuCategories = async (restaurantId) => {
  return await MenuCategory.find({ 
    restaurantId, 
    isDeleted: false 
  }).sort({ displayOrder: 1, createdAt: 1 });
};

// Get category by ID
export const getCategoryById = async (categoryId, restaurantId) => {
  return await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId,
    isDeleted: false 
  });
};

// Create new category
export const createCategory = async (restaurantId, categoryData) => {
  const { name, description, image, displayOrder } = categoryData;
  
  // Check if category name already exists for this restaurant
  const existingCategory = await MenuCategory.findOne({
    restaurantId,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isDeleted: false
  });
  
  if (existingCategory) {
    throw new Error('Category with this name already exists');
  }
  
  const category = new MenuCategory({
    restaurantId,
    name,
    description,
    image,
    displayOrder: displayOrder || 0,
  });
  
  return await category.save();
};

// Update category
export const updateCategory = async (categoryId, restaurantId, updateData) => {
  const { name, description, image, displayOrder, isActive } = updateData;
  
  // If updating name, check for duplicates
  if (name) {
    const existingCategory = await MenuCategory.findOne({
      restaurantId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: categoryId },
      isDeleted: false
    });
    
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
  }
  
  const category = await MenuCategory.findOneAndUpdate(
    { _id: categoryId, restaurantId, isDeleted: false },
    { 
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
    },
    { new: true, runValidators: true }
  );
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category;
};

// Toggle category active status
export const toggleCategoryStatus = async (categoryId, restaurantId) => {
  const category = await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId,
    isDeleted: false 
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  category.isActive = !category.isActive;
  return await category.save();
};

// Delete category (soft delete)
export const deleteCategory = async (categoryId, restaurantId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if category exists
    const category = await MenuCategory.findOne({ 
      _id: categoryId, 
      restaurantId,
      isDeleted: false 
    }).session(session);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Soft delete all items in this category
    await MenuItem.updateMany(
      { categoryId, isDeleted: false },
      { isDeleted: true, isAvailable: false },
      { session }
    );
    
    // Soft delete the category
    category.isDeleted = true;
    category.isActive = false;
    await category.save({ session });
    
    await session.commitTransaction();
    return category;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Menu Item Services
 */

// Get all items for a category
export const getMenuItems = async (categoryId, restaurantId) => {
  // Verify category belongs to restaurant
  const category = await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId,
    isDeleted: false 
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return await MenuItem.find({ 
    categoryId, 
    isDeleted: false 
  }).sort({ displayOrder: 1, createdAt: 1 });
};

// Get item by ID
export const getItemById = async (itemId, restaurantId) => {
  return await MenuItem.findOne({ 
    _id: itemId, 
    isDeleted: false 
  }).populate({
    path: 'categoryId',
    match: { restaurantId, isDeleted: false }
  });
};

// Create new menu item
export const createMenuItem = async (categoryId, restaurantId, itemData) => {
  // Verify category belongs to restaurant
  const category = await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId,
    isDeleted: false 
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  const {
    name,
    description,
    image,
    price,
    prepTime,
    ingredients,
    options,
    displayOrder
  } = itemData;
  
  const item = new MenuItem({
    categoryId,
    name,
    description,
    image,
    price,
    prepTime,
    ingredients: ingredients || [],
    options: options || [],
    displayOrder: displayOrder || 0,
  });
  
  const savedItem = await item.save();
  
  // Update category item count
  await MenuCategory.findByIdAndUpdate(
    categoryId,
    { $inc: { itemCount: 1 } }
  );
  
  return savedItem;
};

// Update menu item
export const updateMenuItem = async (itemId, restaurantId, updateData) => {
  // Verify item belongs to restaurant
  const item = await MenuItem.findOne({ 
    _id: itemId, 
    isDeleted: false 
  }).populate({
    path: 'categoryId',
    match: { restaurantId, isDeleted: false }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  const {
    name,
    description,
    image,
    price,
    prepTime,
    ingredients,
    options,
    displayOrder,
    isAvailable
  } = updateData;
  
  const updatedItem = await MenuItem.findByIdAndUpdate(
    itemId,
    {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(price !== undefined && { price }),
      ...(prepTime !== undefined && { prepTime }),
      ...(ingredients !== undefined && { ingredients }),
      ...(options !== undefined && { options }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isAvailable !== undefined && { isAvailable }),
    },
    { new: true, runValidators: true }
  );
  
  return updatedItem;
};

// Toggle item availability
export const toggleItemAvailability = async (itemId, restaurantId) => {
  const item = await MenuItem.findOne({ 
    _id: itemId, 
    isDeleted: false 
  }).populate({
    path: 'categoryId',
    match: { restaurantId, isDeleted: false }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  item.isAvailable = !item.isAvailable;
  return await item.save();
};

// Delete menu item (soft delete)
export const deleteMenuItem = async (itemId, restaurantId) => {
  const item = await MenuItem.findOne({ 
    _id: itemId, 
    isDeleted: false 
  }).populate({
    path: 'categoryId',
    match: { restaurantId, isDeleted: false }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  item.isDeleted = true;
  item.isAvailable = false;
  const deletedItem = await item.save();
  
  // Update category item count
  await MenuCategory.findByIdAndUpdate(
    item.categoryId._id,
    { $inc: { itemCount: -1 } }
  );
  
  return deletedItem;
};

// Get full menu with categories and items
export const getFullMenu = async (restaurantId) => {
  return await MenuCategory.aggregate([
    { 
      $match: { 
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        isDeleted: false 
      } 
    },
    { $sort: { displayOrder: 1, createdAt: 1 } },
    {
      $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'items',
        pipeline: [
          { $match: { isDeleted: false } },
          { $sort: { displayOrder: 1, createdAt: 1 } }
        ]
      }
    },
    {
      $addFields: {
        itemCount: { $size: '$items' }
      }
    }
  ]);
}; 