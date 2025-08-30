import { asyncHandler } from '../middleware/error/errorHandler.js';
import { createSuccessResponse, createErrorResponse } from '../utils/responseHandler.js';
import Restaurant from '../../models/Restaurant.js';
import MenuCategory from '../../models/MenuCategory.js';
import MenuItem from '../../models/MenuItem.js';
import s3Config from '../config/s3.js';

export const getPublicMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  
  console.log('🔍 Fetching menu for restaurant:', restaurantId);

  // Helper function to convert file paths to full S3 URLs
  const convertToFullUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath; // Already a full URL
    return s3Config.getFileUrl(filePath);
  };

  // Validate restaurant ID format
  if (!restaurantId || restaurantId.length !== 24) {
    return res.status(400).json(createErrorResponse('Invalid restaurant ID', 400));
  }

  // Get restaurant info
  const restaurant = await Restaurant.findById(restaurantId)
    .select('name description logo')
    .lean();

  if (!restaurant) {
    return res.status(404).json(createErrorResponse('Restaurant not found', 404));
  }

  // Convert restaurant logo to full S3 URL
  if (restaurant.logo) {
    restaurant.logo = convertToFullUrl(restaurant.logo);
  }

  // Get menu categories sorted by displayOrder (lowest number first)
  const categories = await MenuCategory.find({ 
    restaurantId,
    isActive: true
  })
  .sort({ displayOrder: 1, name: 1 }) // Sort by displayOrder first, then by name as fallback
  .lean();
  console.log('categories', categories);
  console.log('📋 Found categories:', categories.length);
  
  // Debug: Also check categories without filters
  const allCategories = await MenuCategory.find({ restaurantId }).lean();
  console.log('🔍 All categories (including inactive):', allCategories.map(c => ({ id: c._id, name: c.name, isActive: c.isActive, displayOrder: c.displayOrder })));

  // Convert category images to full S3 URLs (no items loaded initially)
  const categoriesWithImages = categories.map(category => ({
    ...category,
    image: convertToFullUrl(category.image),
    items: [] // Empty array initially - items will be loaded on-demand
  }));

  // Only load items for the first category (default view)
  if (categoriesWithImages.length > 0) {
    const firstCategory = categoriesWithImages[0];
    const firstCategoryItems = await MenuItem.find({
      categoryId: firstCategory._id,
      isAvailable: true,
      isDeleted: false
    })
    .select('name description basePrice image isAvailable hasOptions optionGroups addOns')
    .lean();
    
    console.log(`📦 First category "${firstCategory.name}" has ${firstCategoryItems.length} items`);
    
         // Convert first category items to full S3 URLs and add virtual fields
     firstCategory.items = firstCategoryItems.map(item => {
       let displayPrice = '';
       let minPrice = 0;
       let maxPrice = 0;
       
       if (item.hasOptions && item.optionGroups && item.optionGroups.length > 0) {
         // Calculate min price from options
         minPrice = item.optionGroups.reduce((total, group) => {
           if (group.options && group.options.length > 0) {
             const groupMinPrice = Math.min(...group.options.map(opt => opt.price || 0));
             return total + groupMinPrice;
           }
           return total;
         }, 0);
         
         displayPrice = `From EGP ${minPrice.toFixed(2)}`;
         maxPrice = minPrice; // For now, just use min price
       } else if (item.basePrice) {
         // Has base price, no options
         minPrice = item.basePrice;
         maxPrice = item.basePrice;
         displayPrice = `EGP ${item.basePrice.toFixed(2)}`;
       } else {
         // No price set
         displayPrice = 'Price not set';
       }
       
       return {
         ...item,
         image: convertToFullUrl(item.image),
         // Add virtual price fields
         minPrice,
         maxPrice,
         priceRange: displayPrice
       };
     });
  }

  // For now, let's show all categories (even empty ones) for debugging
  // You can change this later if you only want categories with items
  console.log('🍽️ All categories with images data:', categoriesWithImages);
  
  // Debug: Log some image URLs to verify they're being converted
  if (categoriesWithImages.length > 0) {
    const firstCategory = categoriesWithImages[0];
    console.log('🔗 Sample image URLs:');
    console.log('  Category image:', firstCategory.image);
    if (firstCategory.items && firstCategory.items.length > 0) {
      console.log('  First item image:', firstCategory.items[0].image);
    }
  }

  res.json(createSuccessResponse('Menu retrieved successfully', {
    restaurant,
    categories: categoriesWithImages // Show all categories, not just filtered ones
  }));
});

// Get items for a specific category
export const getCategoryItems = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;
  
  console.log('🔍 Fetching items for category:', categoryId, 'in restaurant:', restaurantId);

  // Helper function to convert file paths to full S3 URLs
  const convertToFullUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath; // Already a full URL
    return s3Config.getFileUrl(filePath);
  };

  // Validate IDs
  if (!restaurantId || restaurantId.length !== 24 || !categoryId || categoryId.length !== 24) {
    return res.status(400).json(createErrorResponse('Invalid restaurant or category ID', 400));
  }

  // Debug: Check if category exists without filters first
  const allCategories = await MenuCategory.find({ restaurantId }).lean();
  console.log('🔍 All categories in restaurant:', allCategories.map(c => ({ id: c._id, name: c.name, isActive: c.isActive })));
  
  // Verify category belongs to restaurant
  const category = await MenuCategory.findOne({ 
    _id: categoryId, 
    restaurantId,
    isActive: true
  }).lean();

  if (!category) {
    console.log('❌ Category not found with filters. Trying without filters...');
    const categoryWithoutFilters = await MenuCategory.findOne({ 
      _id: categoryId, 
      restaurantId
    }).lean();
    
    if (categoryWithoutFilters) {
      console.log('⚠️ Category found but with different status:', {
        id: categoryWithoutFilters._id,
        name: categoryWithoutFilters.name,
        isActive: categoryWithoutFilters.isActive
      });
    }
    
    return res.status(404).json(createErrorResponse('Category not found', 404));
  }

  // Get items for this category
  const items = await MenuItem.find({
    categoryId,
    isAvailable: true,
    isDeleted: false
  })
  .select('name description basePrice image isAvailable hasOptions optionGroups addOns')
  .lean();

  console.log(`📦 Category "${category.name}" has ${items.length} items`);

  // Convert item images to full S3 URLs and add virtual fields
  const itemsWithFullUrls = items.map(item => {
    let displayPrice = '';
    let minPrice = 0;
    let maxPrice = 0;
    
    if (item.hasOptions && item.optionGroups && item.optionGroups.length > 0) {
      // Calculate min price from options
      minPrice = item.optionGroups.reduce((total, group) => {
        if (group.options && group.options.length > 0) {
          const groupMinPrice = Math.min(...group.options.map(opt => opt.price || 0));
          return total + groupMinPrice;
        }
        return total;
      }, 0);
      
      displayPrice = `From EGP ${minPrice.toFixed(2)}`;
      maxPrice = minPrice; // For now, just use min price
    } else if (item.basePrice) {
      // Has base price, no options
      minPrice = item.basePrice;
      maxPrice = item.basePrice;
      displayPrice = `EGP ${item.basePrice.toFixed(2)}`;
    } else {
      // No price set
      displayPrice = 'Price not set';
    }
    
    return {
      ...item,
      image: convertToFullUrl(item.image),
      // Add virtual price fields
      minPrice,
      maxPrice,
      priceRange: displayPrice
    };
  });

  res.json(createSuccessResponse('Category items retrieved successfully', {
    categoryId,
    categoryName: category.name,
    items: itemsWithFullUrls
  }));
});


