import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../../models/User.js';
import Superadmin from '../../models/Superadmin.js';
import RestaurantOwner from '../../models/RestaurantOwner.js';

export const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

export const loginUser = async (email) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: email.split('@')[0], email });
  }
  const sessionId = Math.random().toString(36).substring(2, 15);
  user.sessionId = sessionId;
  await user.save();
  const token = generateToken({ id: user._id, email: user.email, sessionId, role: 'user' });
  return { token, user };
};

export const loginSuperadmin = async (email, password) => {
  const superadmin = await Superadmin.findOne({ email });
  if (!superadmin || !(await superadmin.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }
  const sessionId = Math.random().toString(36).substring(2, 15);
  superadmin.sessionId = sessionId;
  await superadmin.save();
  const token = generateToken({ id: superadmin._id, email: superadmin.email, sessionId, role: 'superadmin' });
  return { token, superadmin };
};

export const loginRestaurantOwner = async (email, password) => {
  const owner = await RestaurantOwner.findOne({ email });
  if (!owner || !(await owner.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }
  const sessionId = Math.random().toString(36).substring(2, 15);
  owner.sessionId = sessionId;
  await owner.save();
  const token = generateToken({ id: owner._id, email: owner.email, sessionId, role: 'restaurantOwner' });
  return { token, owner };
}; 