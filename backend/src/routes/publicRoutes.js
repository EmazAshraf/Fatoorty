import express from 'express';
import { getPublicMenu, getCategoryItems } from '../controllers/publicController.js';

const router = express.Router();

router.get('/menu/:restaurantId', getPublicMenu);
router.get('/menu/:restaurantId/category/:categoryId/items', getCategoryItems);

export default router;
