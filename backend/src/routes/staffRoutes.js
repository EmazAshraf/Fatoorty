import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { uploadStaffFiles } from '../middleware/upload/index.js';
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
router.post('/', uploadStaffFiles, addStaffController);
router.put('/:id', uploadStaffFiles, updateStaffController);
router.delete('/:id', deleteStaffController);

export default router; 