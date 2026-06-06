import { Response } from 'express';
import { garageService } from './garage.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const handleError = (res: Response, error: any) => {
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
  if (error.message === 'CATEGORY_NOT_FOUND') return res.status(404).json({ error: 'Категория не найдена' });
  if (error.message === 'MAX_STAGE_REACHED') return res.status(400).json({ error: 'Максимальный уровень достигнут' });
  if (error.message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: 'Недостаточно средств' });
  
  console.error('[Garage Controller] Error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

export const getMyCars = (req: AuthRequest, res: Response) => {
  try {
    res.json(garageService.getMyCars(req.userId!));
  } catch (error) {
    handleError(res, error);
  }
};

export const selectCar = (req: AuthRequest, res: Response) => {
  try {
    res.json(garageService.selectCar(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const getUpgrades = (req: AuthRequest, res: Response) => {
  try {
    res.json(garageService.getUpgrades(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const buyUpgrade = (req: AuthRequest, res: Response) => {
  try {
    const { carId, categoryId } = req.body;
    res.json(garageService.buyUpgrade(req.userId!, Number(carId), categoryId));
  } catch (error) {
    handleError(res, error);
  }
};

export const getTuning = (req: AuthRequest, res: Response) => {
  try {
    res.json(garageService.getTuning(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const saveTuning = (req: AuthRequest, res: Response) => {
  try {
    const { finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost } = req.body;
    const result = garageService.saveTuning(req.userId!, Number(req.params.carId), {
      finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCosmetics = (req: AuthRequest, res: Response) => {
  try {
    res.json(garageService.getCosmetics(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const saveCosmetics = (req: AuthRequest, res: Response) => {
  try {
    const { paintType, paintColor, wheels, spoiler, intake } = req.body;
    const result = garageService.saveCosmetics(req.userId!, Number(req.params.carId), {
      paintType, paintColor, wheels, spoiler, intake
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
