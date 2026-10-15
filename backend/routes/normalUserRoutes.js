import express from 'express';
import { getAllStores, submitRating } from '../controllers/normalUserController.js';

const router = express.Router();

router.get('/getAllStores', getAllStores);

router.post('/submitRating', submitRating);

export default router;
