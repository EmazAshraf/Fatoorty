import mongoose from 'mongoose';

/**
 * Subscription Model
 * 
 * Manages restaurant subscription plans and billing information.
 * Supports three plan types: static-menu, pay-at-table, and order-and-pay
 * Includes comprehensive payment tracking and subscription status management.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    // Restaurant reference
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    
    // Plan information matching frontend plans
    planId: {
      type: String,
      enum: ['static-menu', 'pay-at-table', 'order-and-pay'],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    
    // Subscription status
    status: {
      type: String,
      enum: ['active', 'cancelled', 'suspended', 'expired', 'pending'],
      default: 'pending',
    },
    
    // Pricing information
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP', // Saudi Riyal
    },
    
    // Billing dates
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    lastBillingDate: {
      type: Date,
    },
    
    // Payment information
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'overdue', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet'],
    },
    
    // TapPay integration fields
    tapPayCustomerId: {
      type: String, // TapPay customer ID
    },
    tapPaySubscriptionId: {
      type: String, // TapPay subscription ID for recurring billing
    },
    lastPaymentId: {
      type: String, // Last TapPay payment ID
    },
    
    // Subscription settings
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    
    // Trial information
    isTrialPeriod: {
      type: Boolean,
      default: false,
    },
    trialStartDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
    
    // Plan features (for easy access without querying subscription service)
    features: {
      qrOrdering: {
        type: Boolean,
        default: false,
      },
      paymentProcessing: {
        type: Boolean,
        default: false,
      },
      analyticsIncluded: {
        type: Boolean,
        default: true,
      },
      orderManagement: {
        type: Boolean,
        default: true,
      },
    },
    
    // Cancellation information
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      enum: ['customer_request', 'payment_failure', 'policy_violation', 'other'],
    },
    
    // Additional metadata
    metadata: {
      type: Map,
      of: String,
    },
    
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
subscriptionSchema.index({ restaurantId: 1, status: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ nextBillingDate: 1, status: 1 });
subscriptionSchema.index({ tapPaySubscriptionId: 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
});

// Virtual for checking if subscription is in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  if (!this.isTrialPeriod || !this.trialEndDate) return false;
  return new Date() < this.trialEndDate;
});

// Static method to get active subscription for a restaurant
subscriptionSchema.statics.getActiveSubscription = function(restaurantId) {
  return this.findOne({
    restaurantId,
    status: 'active',
    isDeleted: false,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gt: new Date() } }
    ]
  });
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = 'customer_request', cancelAtPeriodEnd = true) {
  if (cancelAtPeriodEnd) {
    this.cancelAtPeriodEnd = true;
    this.cancellationReason = reason;
  } else {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    this.endDate = new Date();
  }
  return this.save();
};

// Instance method to reactivate subscription
subscriptionSchema.methods.reactivate = function() {
  this.status = 'active';
  this.cancelAtPeriodEnd = false;
  this.cancelledAt = undefined;
  this.cancellationReason = undefined;
  return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription; 