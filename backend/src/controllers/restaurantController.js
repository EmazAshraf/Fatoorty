import { asyncHandler } from '../middleware/error/errorHandler.js';
import { getAllRestaurants, getRestaurantById, updateRestaurantProfile } from '../services/restaurantService.js';
import Restaurant from '../../models/Restaurant.js';

export const getAllRestaurantsController = asyncHandler(async (req, res) => {
  const restaurants = await getAllRestaurants();
  res.json({ restaurants });
});

export const getRestaurantProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  res.json({ restaurant });
});

export const updateRestaurantProfileController = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { owner: req.user._id },
    req.body,
    { new: true }
  );
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  res.json({ restaurant });
}); 