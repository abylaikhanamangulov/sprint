import { Response } from 'express';
import { notificationsService } from './notifications.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const getAll = (req: AuthRequest, res: Response) => {
  try {
    res.json(notificationsService.getUserNotifications(req.userId!));
  } catch (error) {
    console.error('[Notifications Controller] getAll error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getUnreadCount = (req: AuthRequest, res: Response) => {
  try {
    const count = notificationsService.getUnreadCount(req.userId!);
    res.json({ count });
  } catch (error) {
    console.error('[Notifications Controller] getUnreadCount error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const markAsRead = (req: AuthRequest, res: Response) => {
  try {
    const result = notificationsService.markAsRead(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    console.error('[Notifications Controller] markAsRead error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const markAllAsRead = (req: AuthRequest, res: Response) => {
  try {
    const result = notificationsService.markAllAsRead(req.userId!);
    res.json(result);
  } catch (error) {
    console.error('[Notifications Controller] markAllAsRead error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
