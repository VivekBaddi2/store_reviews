import express from 'express'
import { getAllRatings } from '../controllers/storeOwnerController.js';

const router = express.Router();

router.get('/getAllRatings',getAllRatings);

export default router;
