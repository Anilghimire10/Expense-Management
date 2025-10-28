import { Response } from 'express';
import { logger } from './logger';

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data: Record<string, any> = {},
    statusCode = 200,
  ): Response {
    logger.info(`${message} - ${JSON.stringify(data)}`);
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode = 500): Response {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
