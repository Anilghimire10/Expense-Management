import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { UserService } from '../services/userService';

export const createUserByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.user;

  if (!admin || admin.role !== 'admin') {
    throw new ApiError('Only admins can create new users', 403);
  }

  const { username, email, phone } = req.body;

  if (!username || !email) {
    throw new ApiError('Username and email are required', 400);
  }

  const result = await UserService.createUserByAdmin({
    username,
    email,
    phone,
    createdBy: admin.id,
  });

  return ApiResponse.success(res, result.message, { user: result.user });
});
