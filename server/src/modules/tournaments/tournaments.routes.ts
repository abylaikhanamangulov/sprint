import { Router } from 'express';
import * as tournamentsController from './tournaments.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', tournamentsController.getAll);
router.get('/active', tournamentsController.getActive); 
router.get('/:id', tournamentsController.getOne);

router.post('/:id/join', authMiddleware, tournamentsController.join);

export default router;
