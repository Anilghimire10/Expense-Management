import { Request, Response, NextFunction, RequestHandler } from 'express';
/**
 * utility function to wrap asynchronous route handlers and middlewares
 * automatically catches and forwards error to the express route handlers
 *
 * @param fn-the asynchronous function to wrap
 * @returns a wrapped express route handler
 */

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
