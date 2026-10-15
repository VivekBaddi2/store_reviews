import express from 'express';
import { createUser, createStore, getAllStores, getAllUsers, getAllRatings } from '../controllers/systemAdminController.js';
import { requireRole, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const requireAdministrator = [verifyToken, requireRole('System Administrator')];

router.post('/createUser', ...requireAdministrator, createUser);

router.post('/createStore', ...requireAdministrator, createStore);

router.get('/getAllStores', ...requireAdministrator, getAllStores);

router.get('/getAllUsers', ...requireAdministrator, getAllUsers);

router.get('/getAllRatings', ...requireAdministrator, getAllRatings);


export default router;
