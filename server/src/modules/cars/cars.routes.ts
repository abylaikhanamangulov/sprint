import { Router } from 'express';
import * as carsController from './cars.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', carsController.getAll);
router.get('/starters', carsController.getStarters);
router.get('/:id', carsController.getOne);

router.post('/:id/buy', authMiddleware, carsController.buy);

export default router;