import { Router } from 'express';
import * as racesController from './races.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/history', racesController.getHistory);
router.post('/match', racesController.findMatch);
router.post('/finish', racesController.finishRace);

export default router;
