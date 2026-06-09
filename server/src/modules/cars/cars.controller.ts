import { Request, Response } from 'express';
import { carsService } from './cars.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const getAll = async (_req: Request, res: Response) => {
  res.json(await carsService.getAllCars());
};

export const getStarters = async (_req: Request, res: Response) => {
  res.json(await carsService.getStarterCars());
};

export const getOne = async (req: Request, res: Response) => {
  const car = await carsService.getCarById(Number(req.params.id));
  if (!car) {
    res.status(404).json({ error: MESSAGES.errors.carNotFound });
    return;
  }
  res.json(car);
};

export const buy = async (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.id);
    const result = await carsService.buyCar(req.userId!, carId); 
    
    res.json({ success: true, ...result });
  } catch (error) {
    if ((error as Error).message === 'CAR_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.carNotFound });
    if ((error as Error).message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
    if ((error as Error).message.includes('NOT_ENOUGH')) return res.status(400).json({ error: MESSAGES.errors.notEnoughFunds });

    console.error('[Cars Controller] buy error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};
