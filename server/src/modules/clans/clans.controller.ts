import { Request, Response } from 'express';
import { clansService } from './clans.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

const handleError = (res: Response, error: any) => {
  if (error.message === 'CLAN_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.clanNotFound });
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
  if (error.message === 'NOT_ENOUGH_COINS') return res.status(400).json({ error: MESSAGES.errors.notEnoughCoins });
  if (error.message === 'ALREADY_IN_CLAN') return res.status(400).json({ error: MESSAGES.errors.alreadyInClan });
  
  console.error('[Clans Controller] Error:', error);
  res.status(500).json({ error: MESSAGES.errors.internalServer });
};

export const getAll = async (_req: Request, res: Response) => {
  res.json(await clansService.getAllClans());
};

export const getOne = async (req: Request, res: Response) => {
  try {
    res.json(await clansService.getClanById(Number(req.params.id)));
  } catch (error) {
    handleError(res, error);
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { name, tag, icon, privacy } = req.body;
    const clan = await clansService.createClan(req.userId!, { name, tag, icon, privacy });
    res.json(clan);
  } catch (error) {
    handleError(res, error);
  }
};

export const join = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clansService.joinClan(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const leave = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clansService.leaveClan(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const donate = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clansService.donate(req.userId!, Number(req.params.id), Number(req.body.amount));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clansService.sendChat(req.userId!, Number(req.params.id), req.body.text);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getWar = async (req: AuthRequest, res: Response) => {
  try {
    const result = await clansService.getWarGhost(Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const raceWar = async (req: AuthRequest, res: Response) => {
  try {
    const { warId, playerTime, ghostTime } = req.body;
    const result = await clansService.processWarRace(req.userId!, Number(req.params.id), Number(warId), Number(playerTime), Number(ghostTime));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
