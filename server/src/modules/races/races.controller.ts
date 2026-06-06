import { Response } from 'express';
import { racesService } from './races.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const getHistory = (req: AuthRequest, res: Response) => {
  try {
    const history = racesService.getHistory(req.userId!);
    res.json(history);
  } catch (error) {
    console.error('[Races Controller] getHistory error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
