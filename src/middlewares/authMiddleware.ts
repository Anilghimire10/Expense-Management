import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig';
import { ApiResponse } from '../utils/apiResponse';

interface DecodedToken extends JwtPayload {
  id: string;
  role: string;
  email?: string;
  [key: string]: any;
}

export const authMiddleware =
  (roles: string[] = []) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      ApiResponse.error(res, 'Access denied, token missing', 401);
      return;
    }

    // Ensure token is in the format "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      ApiResponse.error(res, 'Invalid token format', 401);
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.jwt.secret) as DecodedToken;
      (req as any).user = decoded;
      console.log(decoded);
      // Check if user has required roles
      if (roles.length && !roles.includes(decoded.role)) {
        ApiResponse.error(res, 'Unauthorized, role mismatch', 403);
        return;
      }

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        ApiResponse.error(res, 'Token expired', 401);
      } else if (err.name === 'JsonWebTokenError') {
        ApiResponse.error(res, 'Invalid token', 401);
      } else {
        ApiResponse.error(res, 'Unauthorized', 401);
      }
    }
  };
