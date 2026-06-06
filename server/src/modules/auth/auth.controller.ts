import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const login = (req: Request, res: Response): void => {
  try {
    const { telegramId, username, firstName, avatarUrl } = req.body;

    if (!telegramId) {
      res.status(400).json({ error: 'telegramId обязателен' });
      return;
    }

    const result = authService.loginOrRegister({
      telegramId: Number(telegramId),
      username,
      firstName,
      avatarUrl,
    });

    res.json(result);
  } catch (error) {
    console.error('[Auth Controller] Ошибка авторизации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getMe = (req: AuthRequest, res: Response): void => {
  res.json(req.user);
};

export const dailyReward = (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }
    const result = authService.claimDailyReward(req.user.id);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Controller] Ошибка ежедневной награды:', error);
    res.status(400).json({ error: error.message || 'Ошибка получения награды' });
  }
};