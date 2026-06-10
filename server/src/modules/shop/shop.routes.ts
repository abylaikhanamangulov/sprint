import { Router } from 'express';
import * as shopController from './shop.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.get('/', shopController.getCatalog);

router.post('/buy-cosmetic', authMiddleware, shopController.buyCosmetic);
router.post('/buy-crate', authMiddleware, shopController.buyCrate);
router.post('/buy-coins', authMiddleware, shopController.buyCoins);
router.post('/create-invoice', authMiddleware, shopController.createInvoice);
router.post('/packs/:packId/open', authMiddleware, shopController.openPack);

export default router;
