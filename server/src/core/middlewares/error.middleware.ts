import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV !== 'production') {
    logger.error(err);
  } else {
    logger.error(`ERROR 💥: ${err.message}`);
  }

  // Handle specific MongoDB or Zod errors here if needed
  
  if (error instanceof AppError || err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message
    });
  }

  // Generic fallback error
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
};
