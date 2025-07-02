import Restaurant from '../../models/Restaurant.js';

export const getAllRestaurants = async () => {
  return await Restaurant.find();
};

export const getRestaurantById = async (id) => {
  return await Restaurant.findById(id);
};

export const updateRestaurantProfile = async (id, updateData) => {
  return await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
};

export const getRestaurantStatus = async (id) => {
  const restaurant = await Restaurant.findById(id);
  return restaurant ? restaurant.status : null;
}; 