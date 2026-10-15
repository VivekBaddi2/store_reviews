import express from 'express';
import { getAllStores, submitRating } from '../controllers/normalUserController.js';
import { requireRole, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const requireNormalUser = [verifyToken, requireRole('Normal User')];

router.get('/getAllStores', ...requireNormalUser, getAllStores);

router.post('/submitRating', ...requireNormalUser, submitRating);

export default router;
