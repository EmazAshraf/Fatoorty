import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
      minlength: [2, 'Category name must be at least 2 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    image: {
      type: String,
      maxlength: [500, 'Image URL cannot exceed 500 characters'],
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Performance tracking
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
menuCategorySchema.index({ restaurantId: 1, displayOrder: 1 });
menuCategorySchema.index({ restaurantId: 1, isActive: 1, isDeleted: 1 });

// Ensure unique category names per restaurant
menuCategorySchema.index(
  { restaurantId: 1, name: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Virtual for checking if category has items
menuCategorySchema.virtual('hasItems').get(function() {
  return this.itemCount > 0;
});

// Pre-save middleware to update itemCount
menuCategorySchema.pre('save', function(next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.isActive = false;
  }
  next();
});

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);

export default MenuCategory; 