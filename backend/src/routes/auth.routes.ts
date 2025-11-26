import express from 'express';
import { login, register, getCurrentUser, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, changePassword);

export default router;



