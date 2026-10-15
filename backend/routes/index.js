import express from 'express';
import authRouter from './authRoutes.js';
import normalUserRouter from './normalUserRoutes.js';
import storeOwnerRouter from './storeOwnerRoutes.js';
import systemAdminRouter from './systemAdministratorRoutes.js';

const router = express.Router();

router.use('/auth',authRouter)
router.use('/system-admin',systemAdminRouter);
router.use('/normal-user',normalUserRouter);
router.use('/store-owner',storeOwnerRouter);

export default router;