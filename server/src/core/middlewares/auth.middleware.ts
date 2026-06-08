import { Request, Response, NextFunction } from 'express';
import { usersCol } from '../database';
import { User } from '../../../../shared/types';
import { MESSAGES } from '../../constants/messages';

export interface AuthRequest extends Request {
  userId?: number;
  user?: User; 
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const telegramId = req.headers['x-telegram-id'];

    if (!telegramId) {
      const devUser = await usersCol.findOne({ id: 1 });
      if (devUser) {
        req.userId = devUser.id;
        req.user = devUser;
      }
      next();
      return;
    }

    const user = await usersCol.findOne({ telegramId: Number(telegramId) });

    if (!user) {
      res.status(401).json({ error: MESSAGES.errors.userNotFound });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: MESSAGES.errors.userBanned });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
}
