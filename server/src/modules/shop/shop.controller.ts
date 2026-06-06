import { Request, Response } from 'express';
import { shopService } from './shop.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

const handleError = (res: Response, error: any) => {
  if (error.message.includes('NOT_FOUND')) return res.status(404).json({ error: 'Товар или пользователь не найден' });
  if (error.message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: 'Недостаточно средств на балансе' });
  
  console.error('[Shop Controller] Error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

export const getCatalog = (_req: Request, res: Response) => {
  try {
    res.json(shopService.getShopCatalog());
  } catch (error) {
    handleError(res, error);
  }
};

export const buyCosmetic = (req: AuthRequest, res: Response) => {
  try {
    const { cosmeticId } = req.body;
    if (!cosmeticId) return res.status(400).json({ error: 'cosmeticId обязателен' });

    const item = shopService.buyCosmetic(req.userId!, cosmeticId);
    res.json({ success: true, item });
  } catch (error) {
    handleError(res, error);
  }
};

export const buyCrate = (req: AuthRequest, res: Response) => {
  try {
    const { crateId } = req.body;
    if (!crateId) return res.status(400).json({ error: 'crateId обязателен' });

    const drops = shopService.buyCrate(req.userId!, crateId);
    res.json({ success: true, drops });
  } catch (error) {
    handleError(res, error);
  }
};

export const buyGold = (req: AuthRequest, res: Response) => {
  try {
    const { packageId, paymentMethod } = req.body;
    if (!packageId) return res.status(400).json({ error: 'packageId обязателен' });

    const result = shopService.buyGold(req.userId!, packageId);
    res.json({ success: true, ...result, paymentMethod });
  } catch (error) {
    handleError(res, error);
  }
};
