import express from 'express';
import { authenticate, requireSuperadmin } from '../middleware/auth/index.js';

const router = express.Router();

router.use(authenticate, requireSuperadmin);

router.get('/stats', (req, res) => {
  res.json({ stats: { totalRestaurants: 0, totalOrders: 0, totalRevenue: 0 } });
});

router.get('/recent-orders', (req, res) => {
  res.json({ orders: [] });
});

router.get('/top-restaurants', (req, res) => {
  res.json({ restaurants: [] });
});

export default router; 