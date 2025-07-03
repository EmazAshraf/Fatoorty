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
  
  // Enhanced password validation for new superadmin creation
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number' });
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' });
  }
  
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

export const getProfile = asyncHandler(async (req, res) => {
  const superadmin = await Superadmin.findById(req.user._id).select('-password');
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  res.json({ superadmin });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updateData = {};
  
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true }
  ).select('-password');
  
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  res.json({ superadmin });
});

export const updateProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const superadmin = await Superadmin.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: req.file.filename },
    { new: true }
  ).select('-password');
  
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  res.json({ 
    message: 'Profile photo updated successfully',
    filename: req.file.filename,
    superadmin 
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  
  // Enhanced password validation
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one number' });
  }
  
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' });
  }
  
  const superadmin = await Superadmin.findById(req.user._id);
  if (!superadmin) {
    return res.status(404).json({ message: 'Superadmin not found' });
  }
  
  const isValidPassword = await superadmin.comparePassword(currentPassword);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  
  superadmin.password = newPassword;
  await superadmin.save();
  
  res.json({ message: 'Password changed successfully' });
}); 