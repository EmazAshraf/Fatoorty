import express from 'express';
import { authenticate, requireSuperadmin } from '../middleware/auth/index.js';
import { getAllSuperadmins, createSuperadmin, updateSuperadmin } from '../controllers/superadminController.js';

const router = express.Router();

router.use(authenticate, requireSuperadmin);

router.get('/', getAllSuperadmins);
router.post('/', createSuperadmin);
router.put('/profile', updateSuperadmin);

export default router; 