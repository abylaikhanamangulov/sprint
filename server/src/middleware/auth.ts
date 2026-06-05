import { Request, Response, NextFunction } from 'express';
import { dataStore, FILES } from '../data';

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const telegramId = req.headers['x-telegram-id'];

  if (!telegramId) {
    // В dev-режиме используем userId=1 по умолчанию
    const users = dataStore.get<any[]>(FILES.USERS);
    req.userId = 1;
    req.user = users.find(u => u.id === 1);
    next();
    return;
  }

  const users = dataStore.get<any[]>(FILES.USERS);
  const user = users.find(u => u.telegramId === Number(telegramId));

  if (!user) {
    res.status(401).json({ error: 'Пользователь не найден' });
    return;
  }

  req.userId = user.id;
  req.user = user;
  next();
}
