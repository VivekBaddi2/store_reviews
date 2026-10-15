import express from 'express';
import { login, signup, updatePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login',login);

router.post('/signup', signup);

router.post('/updatePassword', updatePassword);

export default router;
