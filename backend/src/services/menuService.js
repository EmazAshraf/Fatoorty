import { MenuCategory, MenuItem } from '../../models/index.js';
import mongoose from 'mongoose';

/**
 * Menu Category Services
 */

// Get all categories for a restaurant
export const getMenuCategories = async (restaurantId) => {
  return await MenuCategory.find({ 
    restaurantId
  }).sort({ displayOrder: 1, createdAt: 1 });
};

// Get category by ID
export const getCategoryById = async (categoryId, restaurantId) => {
  return await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId
  });
};

// Create new category
export const createCategory = async (restaurantId, categoryData) => {
  const { name, description, image, displayOrder } = categoryData;
  
  // Check if category name already exists for this restaurant
  const existingCategory = await MenuCategory.findOne({
    restaurantId,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
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
      _id: { $ne: categoryId }
    });
    
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
  }
  
  const category = await MenuCategory.findOneAndUpdate(
    { _id: categoryId, restaurantId },
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
    restaurantId
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  category.isActive = !category.isActive;
  return await category.save();
};

// Delete category (hard delete)
export const deleteCategory = async (categoryId, restaurantId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Check if category exists
    const category = await MenuCategory.findOne({ 
      _id: categoryId, 
      restaurantId
    }).session(session);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Hard delete all items in this category
    await MenuItem.deleteMany(
      { categoryId },
      { session }
    );
    
    // Hard delete the category
    await MenuCategory.deleteOne(
      { _id: categoryId, restaurantId },
      { session }
    );
    
    await session.commitTransaction();
    return { message: 'Category and all its items deleted successfully' };
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
    restaurantId
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return await MenuItem.find({ 
    categoryId
  }).sort({ displayOrder: 1, createdAt: 1 });
};

// Get item by ID
export const getItemById = async (itemId, restaurantId) => {
  return await MenuItem.findOne({ 
    _id: itemId
  }).populate({
    path: 'categoryId',
    match: { restaurantId }
  });
};

// Create new menu item
export const createMenuItem = async (categoryId, restaurantId, itemData) => {
  // Verify category belongs to restaurant
  const category = await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  const {
    name,
    description,
    image,
    ingredients,
    basePrice,
    hasOptions,
    optionGroups,
    addOns,
    prepTime,
    displayOrder
  } = itemData;
  
  const item = new MenuItem({
    categoryId,
    name,
    description,
    image,
    ingredients,
    basePrice,
    hasOptions,
    optionGroups,
    addOns,
    prepTime,
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
    _id: itemId
  }).populate({
    path: 'categoryId',
    match: { restaurantId }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  const {
    name,
    description,
    image,
    ingredients,
    basePrice,
    hasOptions,
    optionGroups,
    addOns,
    prepTime,
    displayOrder,
    isAvailable
  } = updateData;
  
  const updatedItem = await MenuItem.findByIdAndUpdate(
    itemId,
    {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image }),
      ...(ingredients !== undefined && { ingredients }),
      ...(basePrice !== undefined && { basePrice }),
      ...(hasOptions !== undefined && { hasOptions }),
      ...(optionGroups !== undefined && { optionGroups }),
      ...(addOns !== undefined && { addOns }),
      ...(prepTime !== undefined && { prepTime }),
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
    _id: itemId
  }).populate({
    path: 'categoryId',
    match: { restaurantId }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  item.isAvailable = !item.isAvailable;
  return await item.save();
};

// Delete menu item (hard delete)
export const deleteMenuItem = async (itemId, restaurantId) => {
  const item = await MenuItem.findOne({ 
    _id: itemId
  }).populate({
    path: 'categoryId',
    match: { restaurantId }
  });
  
  if (!item || !item.categoryId) {
    throw new Error('Menu item not found');
  }
  
  // Hard delete the item
  await MenuItem.deleteOne({ _id: itemId });
  
  // Update category item count
  await MenuCategory.findByIdAndUpdate(
    item.categoryId._id,
    { $inc: { itemCount: -1 } }
  );
  
  return { message: 'Menu item deleted successfully' };
};

// Get full menu with categories and items
export const getFullMenu = async (restaurantId) => {
  return await MenuCategory.aggregate([
    { 
      $match: { 
        restaurantId: new mongoose.Types.ObjectId(restaurantId)
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