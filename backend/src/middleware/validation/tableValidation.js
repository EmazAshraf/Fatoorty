import { Staff } from '../../../models/index.js';

// Validate that assigned staff member is a waiter
export const validateWaiterAssignment = async (req, res, next) => {
  try {
    const { waiterId } = req.body;
    
    if (!waiterId) {
      return next(); // No waiter assigned, which is valid
    }

    // Check if the staff member exists and is a waiter
    const staffMember = await Staff.findById(waiterId);
    
    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    if (staffMember.position !== 'waiter') {
      return res.status(400).json({
        success: false,
        message: 'Only waiters can be assigned to tables'
      });
    }

    if (staffMember.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign inactive staff member to table'
      });
    }

    // Check if waiter belongs to the same restaurant
    if (staffMember.restaurantId.toString() !== req.body.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Waiter must belong to the same restaurant'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate table number uniqueness within restaurant
export const validateTableNumber = async (req, res, next) => {
  try {
    const { tableNumber, restaurantId } = req.body;
    const { tableId } = req.params; // For updates

    const Table = (await import('../../../models/Table.js')).default;
    
    const existingTable = await Table.findOne({
      restaurantId,
      tableNumber,
      isDeleted: false,
      _id: { $ne: tableId } // Exclude current table for updates
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table number "${tableNumber}" already exists in this restaurant`
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate table capacity
export const validateTableCapacity = (req, res, next) => {
  const { capacity } = req.body;
  
  if (capacity && (capacity < 1 || capacity > 20)) {
    return res.status(400).json({
      success: false,
      message: 'Table capacity must be between 1 and 20'
    });
  }

  next();
}; 