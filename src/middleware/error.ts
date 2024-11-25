import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';
import { logger } from '@/lib/utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.errors,
    });
  }

  // Log unexpected errors
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: req.headers,
    },
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
