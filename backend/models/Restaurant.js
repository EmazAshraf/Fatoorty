import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantOwner',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    type: {
      type: String,
      enum: ['fastfood', 'fine-dining', 'cafe', 'buffet', 'home-kitchen'],
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    address: {
      type: String,
      required: true,
    },
    verificationGovIdUrl: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    statistics_totalRevenue: {
      type: Number,
      default: 0,
    },
    statistics_totalStaff: {
      type: Number,
      default: 0,
    },
    statistics_successRate: {
      type: Number,
      default: 0,
    },
    statistics_lastUpdated: {
      type: Date,
      default: Date.now,
    },
    
    // Subscription information
    currentSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'suspended', 'cancelled', 'expired'],
      default: 'trial',
    },
    
    // TapPay customer information
    tapPayCustomerId: {
      type: String,
      index: true,
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant; 