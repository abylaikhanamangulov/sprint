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

export const findMatch = async (req: AuthRequest, res: Response) => {
  try {
    const currentPP = req.body.currentPP;
    if (!currentPP) {
      return res.status(400).json({ error: 'currentPP is required' });
    }
    const match = await racesService.findMatch(req.userId!, Number(currentPP));
    res.json(match);
  } catch (error: any) {
    console.error('[Races Controller] findMatch error:', error);
    res.status(400).json({ error: error.message || MESSAGES.errors.internalServer });
  }
};

export const finishRace = async (req: AuthRequest, res: Response) => {
  try {
    const { isWinner, distance } = req.body;
    if (typeof isWinner !== 'boolean') {
      return res.status(400).json({ error: 'isWinner (boolean) is required' });
    }
    const result = await racesService.finishRace(req.userId!, isWinner, distance);
    res.json(result);
  } catch (error: any) {
    console.error('[Races Controller] finishRace error:', error);
    res.status(400).json({ error: error.message || MESSAGES.errors.internalServer });
  }
};
