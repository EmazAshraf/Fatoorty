import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: Number, // Store as number: 1, 2, 3, 4, 5, 6, 7, 8... up to 200
      required: true,
      min: 1, // Table numbers start from 1
      max: 200, // Table numbers cannot exceed 200
      validate: {
        validator: Number.isInteger,
        message: 'Table number must be a whole number'
      }
    },
    waiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: false, // Optional - table might not have assigned waiter
    },
    isOccupied: {
      type: Boolean,  
      default: false, // Table starts as unoccupied
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number, // Number of seats at this table
      default: 4,
    },
    qrCodeUrl: {
      type: String,
      required: true,
      unique: true, // Each QR URL should be unique
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique table numbers per restaurant
tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

// Index for occupied tables and waiter assignments
tableSchema.index({ restaurantId: 1, isOccupied: 1, isDeleted: 1 });
tableSchema.index({ waiterId: 1, isDeleted: 1 });

// Virtual for full table identifier
tableSchema.virtual('tableIdentifier').get(function() {
  return `${this.restaurantId}-${this.tableNumber}`;
});

// Method to generate QR code URL
tableSchema.methods.generateQRUrl = function(baseUrl) {
  return `${baseUrl}/menu?restaurantId=${this.restaurantId}&tableId=${this._id}&tableNumber=${this.tableNumber}`;
};

// Method to assign waiter to table
tableSchema.methods.assignWaiter = function(waiterId) {
  this.waiterId = waiterId;
  return this.save();
};

// Method to unassign waiter from table
tableSchema.methods.unassignWaiter = function() {
  this.waiterId = null;
  return this.save();
};

// Method to mark table as occupied
tableSchema.methods.occupy = function() {
  this.isOccupied = true;
  return this.save();
};

// Method to mark table as available
tableSchema.methods.makeAvailable = function() {
  this.isOccupied = false;
  return this.save();
};

const Table = mongoose.model('Table', tableSchema);

export default Table; 