import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { 
  getAllStaffController, 
  addStaffController, 
  updateStaffController, 
  deleteStaffController,
  getStaffStatsController 
} from '../controllers/staffController.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

router.get('/stats', getStaffStatsController);
router.get('/', getAllStaffController);
router.post('/', addStaffController);
router.put('/:id', updateStaffController);
router.delete('/:id', deleteStaffController);

export default router; 