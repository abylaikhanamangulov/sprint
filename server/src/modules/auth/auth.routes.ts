import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);

router.get('/me', authMiddleware, authController.getMe);

router.post('/daily-reward', authMiddleware, authController.dailyReward);

export default router;