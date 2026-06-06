import { Request, Response } from 'express';
import { carsService } from './cars.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const getAll = (_req: Request, res: Response) => {
  res.json(carsService.getAllCars());
};

export const getStarters = (_req: Request, res: Response) => {
  res.json(carsService.getStarterCars());
};

export const getOne = (req: Request, res: Response) => {
  const car = carsService.getCarById(Number(req.params.id));
  if (!car) {
    res.status(404).json({ error: 'Машина не найдена' });
    return;
  }
  res.json(car);
};

export const buy = (req: AuthRequest, res: Response) => {
  try {
    const carId = Number(req.params.id);
    const result = carsService.buyCar(req.userId!, carId); 
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'CAR_NOT_FOUND') return res.status(404).json({ error: 'Машина не найдена' });
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
    if (error.message.includes('NOT_ENOUGH')) return res.status(400).json({ error: 'Недостаточно средств' });

    console.error('[Cars Controller] buy error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
