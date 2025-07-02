import { asyncHandler } from '../middleware/error/errorHandler.js';
import { loginSuperadmin } from '../services/authService.js';
import Superadmin from '../../models/Superadmin.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const { token, superadmin } = await loginSuperadmin(email, password);
  res.json({
    token,
    superadmin: {
      id: superadmin._id,
      name: superadmin.name,
      email: superadmin.email,
    },
  });
});

export const getAllSuperadmins = asyncHandler(async (req, res) => {
  const superadmins = await Superadmin.find().select('-password');
  res.json({ superadmins });
});

export const createSuperadmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const superadmin = new Superadmin({ name, email, password });
  await superadmin.save();
  res.status(201).json({ superadmin });
});

export const updateSuperadmin = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true }
  ).select('-password');
  res.json({ superadmin });
}); 