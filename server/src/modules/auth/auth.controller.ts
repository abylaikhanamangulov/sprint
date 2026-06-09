import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telegramId, username, firstName, avatarUrl } = req.body;

    if (!telegramId) {
      res.status(400).json({ error: MESSAGES.errors.telegramIdRequired });
      return;
    }

    const result = await authService.loginOrRegister({
      telegramId: Number(telegramId),
      username,
      firstName,
      avatarUrl,
    });

    res.json(result);
  } catch (error) {
    console.error('[Auth Controller]', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const getMe = (req: AuthRequest, res: Response): void => {
  res.json(req.user);
};

export const dailyReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: MESSAGES.errors.unauthorized });
      return;
    }
    const result = await authService.claimDailyReward(req.user.id);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Controller]', error);
    res.status(400).json({ error: error.message || MESSAGES.errors.dailyRewardError });
  }
};

export const selectStarter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: MESSAGES.errors.unauthorized });
      return;
    }
    const { carId } = req.body;
    if (!carId) {
      res.status(400).json({ error: 'Car ID is required' });
      return;
    }
    const result = await authService.selectStarter(req.user.id, carId);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Controller]', error);
    res.status(400).json({ error: error.message || 'Failed to select starter car' });
  }
};