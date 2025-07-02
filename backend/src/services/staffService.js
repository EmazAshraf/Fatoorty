import Staff from '../../models/Staff.js';

export const getAllStaff = async (restaurantId) => {
  return await Staff.find({ restaurant: restaurantId });
};

export const addStaff = async (restaurantId, staffData) => {
  const staff = new Staff({ ...staffData, restaurant: restaurantId });
  return await staff.save();
};

export const updateStaff = async (staffId, updateData) => {
  return await Staff.findByIdAndUpdate(staffId, updateData, { new: true });
};

export const deleteStaff = async (staffId) => {
  return await Staff.findByIdAndDelete(staffId);
}; 