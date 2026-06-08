import { Response } from 'express';
import { notificationsService } from './notifications.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await notificationsService.getUserNotifications(req.userId!));
  } catch (error) {
    console.error('[Notifications Controller] getAll error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationsService.getUnreadCount(req.userId!);
    res.json({ count });
  } catch (error) {
    console.error('[Notifications Controller] getUnreadCount error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationsService.markAsRead(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    console.error('[Notifications Controller] markAsRead error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await notificationsService.markAllAsRead(req.userId!);
    res.json(result);
  } catch (error) {
    console.error('[Notifications Controller] markAllAsRead error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};
