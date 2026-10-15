import express from 'express'
import { getAllRatings } from '../controllers/storeOwnerController.js';
import { requireRole, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/getAllRatings', verifyToken, requireRole('Store Owner'), getAllRatings);

export default router;
