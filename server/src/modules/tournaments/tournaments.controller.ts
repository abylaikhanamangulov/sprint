import { Request, Response } from 'express';
import { tournamentsService } from './tournaments.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

const handleError = (res: Response, error: any) => {
  if (error.message === 'TOURNAMENT_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.tournamentNotFound });
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
  if (error.message === 'ALREADY_PARTICIPATING') return res.status(400).json({ error: MESSAGES.errors.alreadyParticipating });
  if (error.message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: MESSAGES.errors.notEnoughFundsFee });
  
  console.error('[Tournaments Controller] Error:', error);
  res.status(500).json({ error: MESSAGES.errors.internalServer });
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    res.json(await tournamentsService.getAll());
  } catch (error) {
    handleError(res, error);
  }
};

export const getActive = async (_req: Request, res: Response) => {
  try {
    res.json(await tournamentsService.getActive());
  } catch (error) {
    handleError(res, error);
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    res.json(await tournamentsService.getById(Number(req.params.id)));
  } catch (error) {
    handleError(res, error);
  }
};

export const join = async (req: AuthRequest, res: Response) => {
  try {
    const result = await tournamentsService.joinTournament(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
