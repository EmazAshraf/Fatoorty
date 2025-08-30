import express from 'express';
import { authenticate, requireRestaurantOwner } from '../middleware/auth/index.js';
import { listTables, listWaiters, createTable, updateTable, deleteTable, downloadQRCodeImage } from '../controllers/tableController.js';

const router = express.Router();

router.use(authenticate, requireRestaurantOwner);

router.get('/', listTables);
router.get('/waiters', listWaiters);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);
router.get('/:id/qr-image', downloadQRCodeImage);

export default router;
