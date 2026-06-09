import { Request, Response } from 'express';
import { shopService } from './shop.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

const handleError = (res: Response, error: unknown) => {
  if ((error as Error).message.includes('NOT_FOUND')) return res.status(404).json({ error: MESSAGES.errors.itemOrUserNotFound });
  if ((error as Error).message === 'NOT_ENOUGH_FUNDS') return res.status(400).json({ error: MESSAGES.errors.notEnoughFundsBalance });
  
  console.error('[Shop Controller] Error:', error);
  res.status(500).json({ error: MESSAGES.errors.internalServer });
};

export const getCatalog = async (_req: Request, res: Response) => {
  try {
    res.json(await shopService.getShopCatalog());
  } catch (error) {
    handleError(res, error);
  }
};

export const buyCosmetic = async (req: AuthRequest, res: Response) => {
  try {
    const { cosmeticId } = req.body;
    if (!cosmeticId) return res.status(400).json({ error: MESSAGES.errors.cosmeticIdRequired });

    const item = await shopService.buyCosmetic(req.userId!, cosmeticId);
    res.json({ success: true, item });
  } catch (error) {
    handleError(res, error);
  }
};

export const buyCrate = async (req: AuthRequest, res: Response) => {
  try {
    const { crateId } = req.body;
    if (!crateId) return res.status(400).json({ error: MESSAGES.errors.crateIdRequired });

    const drops = await shopService.buyCrate(req.userId!, crateId);
    res.json({ success: true, drops });
  } catch (error) {
    handleError(res, error);
  }
};

export const buyCoins = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, paymentMethod } = req.body;
    if (!packageId) return res.status(400).json({ error: MESSAGES.errors.packageIdRequired });

    const result = await shopService.buyCoins(req.userId!, packageId);
    res.json({ success: true, ...result, paymentMethod });
  } catch (error) {
    handleError(res, error);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ error: MESSAGES.errors.packageIdRequired });

    const url = await shopService.createInvoice(req.userId!, packageId);
    res.json({ success: true, url });
  } catch (error) {
    handleError(res, error);
  }
};
