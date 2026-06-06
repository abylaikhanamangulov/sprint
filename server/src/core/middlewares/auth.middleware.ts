import { Request, Response, NextFunction } from 'express';
import { dataStore, FILES } from '../database';
import { User } from '../../../../shared/types';

export interface AuthRequest extends Request {
  userId?: number;
  user?: User; 
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const telegramId = req.headers['x-telegram-id'];

  const users = dataStore.get(FILES.USERS);

  if (!telegramId) {
    const devUser = users.find(u => u.id === 1);
    if (devUser) {
      req.userId = devUser.id;
      req.user = devUser;
    }
    next();
    return;
  }

  const user = users.find(u => u.telegramId === Number(telegramId));

  if (!user) {
    res.status(401).json({ error: 'Пользователь не найден' });
    return;
  }

  req.userId = user.id;
  req.user = user;
  next();
}
