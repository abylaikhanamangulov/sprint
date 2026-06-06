import { Router } from 'express';
import * as shopController from './shop.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', shopController.getCatalog);

router.post('/buy-cosmetic', authMiddleware, shopController.buyCosmetic);
router.post('/buy-crate', authMiddleware, shopController.buyCrate);
router.post('/buy-gold', authMiddleware, shopController.buyGold);

export default router;
