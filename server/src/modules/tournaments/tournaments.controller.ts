import { Request, Response } from 'express';
import { tournamentsService } from './tournaments.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const handleError = (res: Response, error: any) => {
  if (error.message === 'TOURNAMENT_NOT_FOUND') return res.status(404).json({ error: 'Турнир не найден' });
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
  if (error.message === 'ALREADY_PARTICIPATING') return res.status(400).json({ error: 'Вы уже участвуете в этом турнире' });
  if (error.message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: 'Недостаточно средств для взноса' });
  
  console.error('[Tournaments Controller] Error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

export const getAll = (_req: Request, res: Response) => {
  try {
    res.json(tournamentsService.getAll());
  } catch (error) {
    handleError(res, error);
  }
};

export const getActive = (_req: Request, res: Response) => {
  try {
    res.json(tournamentsService.getActive());
  } catch (error) {
    handleError(res, error);
  }
};

export const getOne = (req: Request, res: Response) => {
  try {
    res.json(tournamentsService.getById(Number(req.params.id)));
  } catch (error) {
    handleError(res, error);
  }
};

export const join = (req: AuthRequest, res: Response) => {
  try {
    const result = tournamentsService.joinTournament(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
