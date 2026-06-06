import { Router } from 'express';
import * as profileController from './profile.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/leaderboard', profileController.getLeaderboard);

router.use(authMiddleware);
router.get('/', profileController.getProfile);
router.put('/settings', profileController.updateSettings);

export default router;
