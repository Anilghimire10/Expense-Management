import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !phone || !password) {
    throw new ApiError('All fields are required', 400);
  }

  const result = await AuthService.registerUser({ username, email, phone, password });

  return ApiResponse.success(
    res,
    'User registered successfully. Please check your email for the verification code.',
    { user: result.user },
  );
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    throw new ApiError('Email and verification code are required', 400);
  }

  const result = await AuthService.verifyEmail(email, verificationCode);
  return ApiResponse.success(res, 'Email verified successfully', result);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError('Email and password are required', 400);
  }

  const result = await AuthService.loginUser(email, password);

  return ApiResponse.success(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new ApiError('Refresh token is required and must be a string', 400);
  }

  const result = await AuthService.refreshToken(refreshToken);

  return ApiResponse.success(res, 'Token refreshed successfully', {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError('Email is required', 400);
  }

  await AuthService.forgotPassword(email);

  return ApiResponse.success(
    res,
    'If an account exists with this email, a reset code has been sent',
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  if (!email || !resetCode || !newPassword || !confirmPassword) {
    throw new ApiError('All fields are required', 400);
  }

  await AuthService.resetPassword(email, resetCode, newPassword, confirmPassword);

  ApiResponse.success(res, 'Password has been reset successfully');
});
