import mongoose from 'mongoose';

const tableQRSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
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

// Compound index to ensure unique table numbers per restaurant
tableQRSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const TableQR = mongoose.model('TableQR', tableQRSchema);

export default TableQR; 