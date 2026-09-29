import { Router } from 'express';
import { rewardsController } from './rewards.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

export const rewardsRoutes = Router();

rewardsRoutes.use(authMiddleware);

rewardsRoutes.get('/status', (req, res) => rewardsController.getStatus(req, res));
rewardsRoutes.post('/claim-daily', (req, res) => rewardsController.claimDaily(req, res));
rewardsRoutes.post('/claim-founder', (req, res) => rewardsController.claimFounder(req, res));
rewardsRoutes.post('/claim-holiday', (req, res) => rewardsController.claimHoliday(req, res));
