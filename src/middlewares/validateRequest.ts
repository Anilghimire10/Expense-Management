import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { ApiResponse } from '../utils/apiResponse';

export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((err) => err.message).join('');
      ApiResponse.error(res, details, 400);
      return;
    }
    next();
  };
};
