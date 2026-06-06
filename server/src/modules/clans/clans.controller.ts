import { Request, Response } from 'express';
import { clansService } from './clans.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const handleError = (res: Response, error: any) => {
  if (error.message === 'CLAN_NOT_FOUND') return res.status(404).json({ error: 'Клан не найден' });
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
  if (error.message === 'NOT_ENOUGH_SILVER') return res.status(400).json({ error: 'Недостаточно серебра' });
  if (error.message === 'ALREADY_IN_CLAN') return res.status(400).json({ error: 'Вы уже в клане' });
  
  console.error('[Clans Controller] Error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

export const getAll = (_req: Request, res: Response) => {
  res.json(clansService.getAllClans());
};

export const getOne = (req: Request, res: Response) => {
  try {
    res.json(clansService.getClanById(Number(req.params.id)));
  } catch (error) {
    handleError(res, error);
  }
};

export const create = (req: AuthRequest, res: Response) => {
  try {
    const { name, tag, icon, privacy } = req.body;
    const clan = clansService.createClan(req.userId!, { name, tag, icon, privacy });
    res.json(clan);
  } catch (error) {
    handleError(res, error);
  }
};

export const join = (req: AuthRequest, res: Response) => {
  try {
    const result = clansService.joinClan(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const leave = (req: AuthRequest, res: Response) => {
  try {
    const result = clansService.leaveClan(req.userId!, Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const donate = (req: AuthRequest, res: Response) => {
  try {
    const result = clansService.donate(req.userId!, Number(req.params.id), Number(req.body.amount));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const chat = (req: AuthRequest, res: Response) => {
  try {
    const result = clansService.sendChat(req.userId!, Number(req.params.id), req.body.text);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getWar = (req: AuthRequest, res: Response) => {
  try {
    const result = clansService.getWarGhost(Number(req.params.id));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const raceWar = (req: AuthRequest, res: Response) => {
  try {
    const { warId, playerTime, ghostTime } = req.body;
    const result = clansService.processWarRace(req.userId!, Number(req.params.id), Number(warId), Number(playerTime), Number(ghostTime));
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
