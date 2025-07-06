import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: true,
      index: true,
    },
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
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      max: [99999, 'Price cannot exceed 99,999'],
    },
    
    // Rating (read-only, calculated from customer reviews)
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
    
    // Optional preparation time
    prepTime: {
      type: Number,
      min: [1, 'Prep time must be at least 1 minute'],
      max: [240, 'Prep time cannot exceed 240 minutes'],
    },
    
    // Ingredients with limits
    ingredients: {
      type: [String],
      validate: {
        validator: function(arr) {
          return arr.length <= 20; // Max 20 ingredients
        },
        message: 'Cannot have more than 20 ingredients'
      },
    },
    
    // Optional item variations/options
    options: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [30, 'Option name cannot exceed 30 characters'],
      },
      type: {
        type: String,
        enum: ['single-select', 'multi-select'],
        default: 'single-select',
      },
      required: {
        type: Boolean,
        default: false,
      },
      choices: [{
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [40, 'Choice name cannot exceed 40 characters'],
        },
        priceModifier: {
          type: Number,
          default: 0,
          min: [-999, 'Price modifier cannot be less than -999'],
          max: [999, 'Price modifier cannot exceed 999'],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      }],
    }],
    
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    
    // Performance tracking
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Validation for ingredients array elements
menuItemSchema.path('ingredients').validate(function(ingredients) {
  return ingredients.every(ingredient => 
    typeof ingredient === 'string' && 
    ingredient.length <= 30 && 
    ingredient.length >= 2
  );
}, 'Each ingredient must be 2-30 characters long');

// Validation for options array
menuItemSchema.path('options').validate(function(options) {
  return options.length <= 5; // Max 5 option groups per item
}, 'Cannot have more than 5 option groups per item');

// Validation for choices within options
menuItemSchema.path('options').validate(function(options) {
  return options.every(option => 
    option.choices.length <= 10 && option.choices.length >= 1
  );
}, 'Each option must have 1-10 choices');

// Compound indexes for performance
menuItemSchema.index({ categoryId: 1, displayOrder: 1 });
menuItemSchema.index({ categoryId: 1, isAvailable: 1, isDeleted: 1 });
menuItemSchema.index({ categoryId: 1, price: 1 });
menuItemSchema.index({ 'rating.average': -1 }); // For popular items

// Virtual for checking if item has options
menuItemSchema.virtual('hasOptions').get(function() {
  return this.options && this.options.length > 0;
});

// Pre-save middleware
menuItemSchema.pre('save', function(next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.isAvailable = false;
  }
  next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem; 