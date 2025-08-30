import mongoose from "mongoose";

const AddOnSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [50, 'Add-on name cannot exceed 50 characters']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'],
    max: [9999, 'Price cannot exceed 9,999']
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  maxQuantity: { 
    type: Number, 
    default: 10, 
    min: 1 
  }
}, { _id: false });

const OptionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [50, 'Option name cannot exceed 50 characters']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'],
    max: [9999, 'Price cannot exceed 9,999']
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

const OptionGroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  isRequired: { 
    type: Boolean, 
    default: true 
  },
  options: {
    type: [OptionSchema],
    required: true,
    validate: [
      options => options && options.length > 0, 
      'Option group must have at least one option'
    ]
  }
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true,
  },
  
  // Basic Item Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [80, 'Item name cannot exceed 80 characters'],
    minlength: [2, 'Item name must be at least 2 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  image: {
    type: String,
    maxlength: [500, 'Image URL cannot exceed 500 characters'],
  },
  
  // Ingredients list
  ingredients: [{ 
    type: String,
    trim: true,
    maxlength: [50, 'Ingredient name cannot exceed 50 characters']
  }],
  
  // Pricing System
  basePrice: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    max: [99999, 'Price cannot exceed 99,999'],
    // Base price is used only when hasOptions = false
  },
  
  // Options Configuration
  hasOptions: { 
    type: Boolean, 
    default: false 
  },
  optionGroups: [OptionGroupSchema],
  
  // Add-ons (extras that can be added to any item)
  addOns: [AddOnSchema],
  
  // Item Configuration
  isAvailable: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Statistics and Tracking
  totalOrders: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  prepTime: {
    type: Number,
    min: [1, 'Prep time must be at least 1 minute'],
    max: [240, 'Prep time cannot exceed 240 minutes'],
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Validation for option groups
menuItemSchema.path('optionGroups').validate(function(groups) {
  if (!groups || groups.length === 0) return true;
  
  // Max 5 option groups
  if (groups.length > 5) {
    throw new Error('Cannot have more than 5 option groups');
  }
  
  return true;
}, 'Invalid option groups configuration');

// Validation for add-ons
menuItemSchema.path('addOns').validate(function(addOns) {
  if (!addOns || addOns.length === 0) return true;
  
  // Max 20 add-ons
  if (addOns.length > 20) {
    throw new Error('Cannot have more than 20 add-ons');
  }
  
  // Check for duplicate names
  const names = addOns.map(addon => addon.name.toLowerCase());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    throw new Error('Add-on names must be unique');
  }
  
  return true;
}, 'Invalid add-ons configuration');

// Validation for ingredients
menuItemSchema.path('ingredients').validate(function(ingredients) {
  if (!ingredients || ingredients.length === 0) return true;
  
  // Max 20 ingredients
  if (ingredients.length > 20) {
    throw new Error('Cannot have more than 20 ingredients');
  }
  
  // Check for duplicate names
  const names = ingredients.map(ingredient => ingredient.toLowerCase());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    throw new Error('Ingredient names must be unique');
  }
  
  return true;
}, 'Invalid ingredients configuration');

// Compound indexes for performance
menuItemSchema.index({ categoryId: 1, displayOrder: 1 });
menuItemSchema.index({ categoryId: 1, isAvailable: 1 });
menuItemSchema.index({ categoryId: 1, isDeleted: 1 });
menuItemSchema.index({ 'optionGroups.options.price': 1 });
menuItemSchema.index({ 'addOns.price': 1 });

// Virtual for getting minimum price
menuItemSchema.virtual('minPrice').get(function() {
  if (this.optionGroups && this.optionGroups.length > 0) {
    // If options exist, calculate min price from all option groups
    let minPrice = 0;
    this.optionGroups.forEach(group => {
      if (group.options && group.options.length > 0) {
        const availableOptions = group.options.filter(option => option.isAvailable);
        if (availableOptions.length > 0) {
          // Sort options by price and take the minimum (1 option)
          const sortedOptions = availableOptions.sort((a, b) => a.price - b.price);
          const selectedOptions = sortedOptions.slice(0, 1);
          minPrice += selectedOptions.reduce((sum, option) => sum + option.price, 0);
        }
      }
    });
    return minPrice;
  } else {
    // If no options, use base price
    return this.basePrice || 0;
  }
});

// Virtual for getting maximum price
menuItemSchema.virtual('maxPrice').get(function() {
  if (this.optionGroups && this.optionGroups.length > 0) {
    // If options exist, calculate max price from all option groups
    let maxPrice = 0;
    this.optionGroups.forEach(group => {
      if (group.options && group.options.length > 0) {
        const availableOptions = group.options.filter(option => option.isAvailable);
        if (availableOptions.length > 0) {
          // Sort options by price and take the maximum (1 option)
          const sortedOptions = availableOptions.sort((a, b) => b.price - a.price);
          const selectedOptions = sortedOptions.slice(0, 1);
          maxPrice += selectedOptions.reduce((sum, option) => sum + option.price, 0);
        }
      }
    });
    return maxPrice;
  } else {
    // If no options, use base price
    return this.basePrice || 0;
  }
});

// Virtual for price range display
menuItemSchema.virtual('priceRange').get(function() {
  if (this.optionGroups && this.optionGroups.length > 0) {
    const min = this.minPrice;
    const max = this.maxPrice;
    if (min === max) {
      return `EGP ${min}`;
    }
    return `EGP ${min} - ${max}`;
  } else {
    return this.basePrice ? `EGP ${this.basePrice}` : 'Price not set';
  }
});

// Virtual for checking if item is configurable
menuItemSchema.virtual('isConfigurable').get(function() {
  return (this.optionGroups && this.optionGroups.length > 0) || (this.addOns && this.addOns.length > 0);
});

// Pre-save middleware to generate IDs and set defaults
menuItemSchema.pre('save', function(next) {
  // Generate IDs for option groups and options if not provided
  if (this.optionGroups) {
    this.optionGroups.forEach((group, groupIndex) => {
      if (!group.id) {
        group.id = `group_${groupIndex}`;
      }
      group.options.forEach((option, optionIndex) => {
        if (!option.id) {
          option.id = `option_${groupIndex}_${optionIndex}`;
        }
      });
    });
  }
  
  // Generate IDs for add-ons if not provided
  if (this.addOns) {
    this.addOns.forEach((addon, addonIndex) => {
      if (!addon.id) {
        addon.id = `addon_${addonIndex}`;
      }
    });
  }
  
  next();
});

// Ensure virtual fields are included in JSON output
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

export default mongoose.model('MenuItem', menuItemSchema); 