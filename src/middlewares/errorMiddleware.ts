import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';

export const errorMiddleware = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = (err instanceof ApiError ? err.statusCode : undefined) ?? 500;
  const message = err.message || 'Internal Server Error';

  // Logging the error
  logger.error(`[ERROR] ${message} - ${err.stack || 'No stack trace available'}`);

  // Sending error response
  ApiResponse.error(res, message, statusCode);
};
