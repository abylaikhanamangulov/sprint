import { Request, Response } from 'express';
import { profileService } from './profile.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await profileService.getProfile(req.userId!));
  } catch (error) {
    if ((error as Error).message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
    console.error('[Profile Controller] getProfile error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await profileService.updateSettings(req.userId!, req.body));
  } catch (error) {
    console.error('[Profile Controller] updateSettings error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    res.json(await profileService.getLeaderboard());
  } catch (error) {
    console.error('[Profile Controller] getLeaderboard error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};
