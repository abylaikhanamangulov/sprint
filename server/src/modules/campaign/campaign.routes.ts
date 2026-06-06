import { Router } from 'express';
import * as campaignController from './campaign.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/chapters', campaignController.getChapters);
router.get('/chapters/:id', campaignController.getChapter);

router.post('/pve', campaignController.playPvE); 

export default router;