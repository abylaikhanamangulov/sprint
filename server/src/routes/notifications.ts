import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const notifications = dataStore.get<any[]>(FILES.NOTIFICATIONS);
  const userNotifications = notifications
    .filter(n => n.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifications);
});

router.get('/unread-count', authMiddleware, (req: AuthRequest, res) => {
  const notifications = dataStore.get<any[]>(FILES.NOTIFICATIONS);
  const count = notifications.filter(n => n.userId === req.userId && !n.read).length;
  res.json({ count });
});

router.post('/:id/read', authMiddleware, (req: AuthRequest, res) => {
  const notifId = Number(req.params.id);
  dataStore.update<any[]>(FILES.NOTIFICATIONS, notifications =>
    notifications.map(n => n.id === notifId && n.userId === req.userId ? { ...n, read: true } : n)
  );
  res.json({ success: true });
});

router.post('/read-all', authMiddleware, (req: AuthRequest, res) => {
  dataStore.update<any[]>(FILES.NOTIFICATIONS, notifications =>
    notifications.map(n => n.userId === req.userId ? { ...n, read: true } : n)
  );
  res.json({ success: true });
});

export default router;
