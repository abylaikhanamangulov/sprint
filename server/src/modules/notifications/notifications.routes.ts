import { Router } from 'express';
import * as notificationsController from './notifications.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationsController.getAll);
router.get('/unread-count', notificationsController.getUnreadCount);
router.post('/:id/read', notificationsController.markAsRead);
router.post('/read-all', notificationsController.markAllAsRead);

export default router;
