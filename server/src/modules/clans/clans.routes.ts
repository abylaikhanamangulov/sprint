import { Router } from 'express';
import * as clansController from './clans.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', clansController.getAll);
router.get('/:id', clansController.getOne);

router.use(authMiddleware); 

router.post('/create', clansController.create);
router.post('/:id/join', clansController.join);
router.post('/:id/leave', clansController.leave);
router.post('/:id/donate', clansController.donate);
router.post('/:id/chat', clansController.chat);
router.get('/:id/war', clansController.getWar);
router.post('/:id/war/race', clansController.raceWar);

export default router;
