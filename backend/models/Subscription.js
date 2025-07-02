import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    planType: {
      type: String,
      enum: ['Free', 'Premium'],
      default: 'Free',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'failed'],
      default: 'paid',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription; 