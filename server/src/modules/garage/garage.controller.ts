import { Response } from 'express';
import { garageService } from './garage.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

const handleError = (res: Response, error: any) => {
  if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
  if (error.message === 'CATEGORY_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.categoryNotFound });
  if (error.message === 'MAX_STAGE_REACHED') return res.status(400).json({ error: MESSAGES.errors.maxStageReached });
  if (error.message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: MESSAGES.errors.notEnoughFunds });
  
  console.error('[Garage Controller] Error:', error);
  res.status(500).json({ error: MESSAGES.errors.internalServer });
};

export const getMyCars = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await garageService.getMyCars(req.userId!));
  } catch (error) {
    handleError(res, error);
  }
};

export const selectCar = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await garageService.selectCar(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const getUpgrades = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await garageService.getUpgrades(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const buyUpgrade = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, categoryId } = req.body;
    res.json(await garageService.buyUpgrade(req.userId!, Number(carId), categoryId));
  } catch (error) {
    handleError(res, error);
  }
};

export const getTuning = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await garageService.getTuning(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const saveTuning = async (req: AuthRequest, res: Response) => {
  try {
    const { finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost } = req.body;
    const result = await garageService.saveTuning(req.userId!, Number(req.params.carId), {
      finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCosmetics = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await garageService.getCosmetics(req.userId!, Number(req.params.carId)));
  } catch (error) {
    handleError(res, error);
  }
};

export const saveCosmetics = async (req: AuthRequest, res: Response) => {
  try {
    const { paintType, paintColor, wheels, spoiler, intake } = req.body;
    const result = await garageService.saveCosmetics(req.userId!, Number(req.params.carId), {
      paintType, paintColor, wheels, spoiler, intake
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
