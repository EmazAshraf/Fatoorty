import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    lowercase: true
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  profilePhoto: {
    type: String,
    default: null
  },
  governmentIdUrl: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
staffSchema.index({ restaurantId: 1, isDeleted: 1 });
// Compound unique index: same email allowed across different restaurants
staffSchema.index({ email: 1, restaurantId: 1, isDeleted: 1 }, { unique: true });

export default mongoose.model('Staff', staffSchema); 