import express from 'express';
import { login, signup, updatePassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login',login);

router.post('/signup', signup);

router.post('/updatePassword', verifyToken, updatePassword);

export default router;
