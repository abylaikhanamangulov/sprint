import { Request, Response } from 'express';
import { profileService } from './profile.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const getProfile = (req: AuthRequest, res: Response) => {
  try {
    res.json(profileService.getProfile(req.userId!));
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
    console.error('[Profile Controller] getProfile error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const updateSettings = (req: AuthRequest, res: Response) => {
  try {
    res.json(profileService.updateSettings(req.userId!, req.body));
  } catch (error) {
    console.error('[Profile Controller] updateSettings error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getLeaderboard = (_req: Request, res: Response) => {
  try {
    res.json(profileService.getLeaderboard());
  } catch (error) {
    console.error('[Profile Controller] getLeaderboard error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
