import express from 'express';
import { authenticate, requireSuperadmin } from '../middleware/auth/index.js';
import { uploadProfilePhoto } from '../middleware/upload/index.js';
import { getAllSuperadmins, createSuperadmin, updateSuperadmin, getProfile, updateProfile, updateProfilePhoto, changePassword } from '../controllers/superadminController.js';

const router = express.Router();

router.use(authenticate, requireSuperadmin);

router.get('/', getAllSuperadmins);
router.post('/', createSuperadmin);
router.put('/profile', updateSuperadmin);

// Settings routes
router.get('/profile', getProfile);
router.put('/settings/profile', updateProfile);
router.post('/settings/profile-photo', uploadProfilePhoto, updateProfilePhoto);
router.put('/settings/password', changePassword);

export default router; 