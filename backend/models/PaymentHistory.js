import mongoose from 'mongoose';

/**
 * Payment History Model
 * 
 * Tracks all payment transactions for restaurant subscriptions.
 * Maintains complete audit trail of all payment attempts and their outcomes.
 * Integrates with TapPay payment gateway for the Saudi Arabian market.
 */
const paymentHistorySchema = new mongoose.Schema(
  {
    // References
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    
    // TapPay payment information
    tapPayPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tapPayTransactionId: {
      type: String,
    },
    tapPayChargeId: {
      type: String,
    },
    
    // Payment details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'SAR',
    },
    
    // Payment status tracking
    status: {
      type: String,
      enum: [
        'pending',    // Payment initiated but not completed
        'processing', // Payment being processed by gateway
        'succeeded',  // Payment completed successfully
        'failed',     // Payment failed
        'cancelled',  // Payment cancelled by user
        'refunded',   // Payment was refunded
        'disputed',   // Payment disputed/chargeback
      ],
      required: true,
      default: 'pending',
    },
    
    // Payment method information
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet', 'apple_pay', 'google_pay'],
        required: true,
      },
      // Card information (if applicable)
      cardLast4: String,
      cardBrand: String, // visa, mastercard, mada, etc.
      cardCountry: String,
      
      // Bank transfer information (if applicable)
      bankName: String,
      
      // Wallet information (if applicable)
      walletProvider: String,
    },
    
    // Billing period information
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    
    // Payment attempt information
    attemptCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    isRetry: {
      type: Boolean,
      default: false,
    },
    originalPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentHistory',
    },
    
    // Failure information
    failureReason: {
      type: String,
    },
    failureCode: {
      type: String,
    },
    
    // Refund information
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundDate: {
      type: Date,
    },
    refundReason: {
      type: String,
    },
    refundId: {
      type: String,
    },
    
    // Invoice information
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    
    // Tax information (for Saudi Arabia)
    vatAmount: {
      type: Number,
      default: 0,
    },
    vatRate: {
      type: Number,
      default: 0.15, // 15% VAT in Saudi Arabia
    },
    subtotal: {
      type: Number,
    },
    
    // Timestamps for payment lifecycle
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    
    // Additional metadata from TapPay
    gatewayResponse: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    
    // Internal notes
    notes: {
      type: String,
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
paymentHistorySchema.index({ restaurantId: 1, createdAt: -1 });
paymentHistorySchema.index({ subscriptionId: 1, createdAt: -1 });
paymentHistorySchema.index({ status: 1, createdAt: -1 });
paymentHistorySchema.index({ 'billingPeriod.startDate': 1, 'billingPeriod.endDate': 1 });
paymentHistorySchema.index({ tapPayPaymentId: 1 });
paymentHistorySchema.index({ invoiceNumber: 1 });

// Virtual for checking if payment is successful
paymentHistorySchema.virtual('isSuccessful').get(function() {
  return this.status === 'succeeded';
});

// Virtual for checking if payment is failed
paymentHistorySchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled'].includes(this.status);
});

// Virtual for net amount (amount - refund)
paymentHistorySchema.virtual('netAmount').get(function() {
  return this.amount - (this.refundAmount || 0);
});

// Static method to get payment history for a restaurant
paymentHistorySchema.statics.getRestaurantPayments = function(restaurantId, limit = 10) {
  return this.find({
    restaurantId,
    isDeleted: false,
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('subscriptionId', 'planId planName');
};

// Static method to get successful payments for a subscription
paymentHistorySchema.statics.getSuccessfulPayments = function(subscriptionId) {
  return this.find({
    subscriptionId,
    status: 'succeeded',
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

// Instance method to mark payment as succeeded
paymentHistorySchema.methods.markSucceeded = function(tapPayResponse = {}) {
  this.status = 'succeeded';
  this.completedAt = new Date();
  this.gatewayResponse = tapPayResponse;
  return this.save();
};

// Instance method to mark payment as failed
paymentHistorySchema.methods.markFailed = function(reason, code, tapPayResponse = {}) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  this.failureCode = code;
  this.gatewayResponse = tapPayResponse;
  return this.save();
};

// Instance method to process refund
paymentHistorySchema.methods.processRefund = function(amount, reason, refundId) {
  this.refundAmount = amount;
  this.refundDate = new Date();
  this.refundReason = reason;
  this.refundId = refundId;
  
  // If fully refunded, update status
  if (amount >= this.amount) {
    this.status = 'refunded';
  }
  
  return this.save();
};

// Pre-save hook to generate invoice number
paymentHistorySchema.pre('save', function(next) {
  if (this.isNew && !this.invoiceNumber) {
    // Generate invoice number: INV-YYYY-MM-DD-XXXXX
    const date = new Date().toISOString().split('T')[0];
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.invoiceNumber = `INV-${date}-${random}`;
  }
  
  // Calculate subtotal and VAT if not provided
  if (!this.subtotal && this.amount) {
    this.subtotal = this.amount / (1 + this.vatRate);
    this.vatAmount = this.amount - this.subtotal;
  }
  
  next();
});

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

export default PaymentHistory; 