import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../logger';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let error = { ...(err as any) };
  error.message = (err as Error).message;

  if (process.env.NODE_ENV !== 'production') {
    logger.error(err);
  } else {
    logger.error(`ERROR 💥: ${(err as Error).message}`);
  }

  // Handle specific MongoDB or Zod errors here if needed
  
  if (error instanceof AppError || err instanceof AppError) {
    return res.status((err as any).statusCode || 500).json({
      success: false,
      error: (err as Error).message
    });
  }

  // Generic fallback error
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};
