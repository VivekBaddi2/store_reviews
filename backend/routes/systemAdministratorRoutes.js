import express from 'express';
import { createUser, createStore, getAllStores, getAllUsers, getAllRatings } from '../controllers/systemAdminController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/createUser', verifyToken, createUser);

router.post('/createStore', verifyToken, createStore);

router.get('/getAllStores', verifyToken, getAllStores);

router.get('/getAllUsers', verifyToken, getAllUsers);

router.get('/getAllRatings', verifyToken, getAllRatings);


export default router;
