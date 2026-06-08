import { Response } from 'express';
import { racesService } from './races.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await racesService.getHistory(req.userId!);
    res.json(history);
  } catch (error) {
    console.error('[Races Controller] getHistory error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};
