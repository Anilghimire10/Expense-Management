import { IUser, User } from '../models/userModel';
import { ApiError } from '../utils/apiError';
import { sendMail } from '../utils/mailHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Types } from 'mongoose';

interface AccessTokenPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface RefreshTokenPayload {
  id: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  user: any;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async registerUser(data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const { username, email, phone, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      throw new ApiError('User already exists with this email', 400);
    }

    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      phoneNumber: phone,
      password,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    const emailBody = `
    <div style="text-align: center; font-family: Arial, sans-serif;">
      <h1>Welcome, ${username}!</h1>
      <p>Please use the following 4-digit code to verify your email:</p>
      <h2 style="color: #4CAF50; letter-spacing: 5px;">${verificationCode}</h2>
      <p>This code is valid for 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

    try {
      await sendMail({
        recipientEmail: email,
        subject: 'Verify Your Email',
        emailBody,
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw new ApiError('Failed to send verification email', 500);
    }

    return {
      success: true,
      user: user.toCleanObject(),
    };
  }

  static async verifyEmail(email: string, verificationCode: string) {
    const user = await User.findOne({ email, verificationCode });
    if (!user) {
      throw new ApiError('Invalid or expired verification code', 400);
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      throw new ApiError('Verification code has expired', 400);
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return {
      success: true,
      user: user.toCleanObject(),
    };
  }

  static async loginUser(email: string, password: string): Promise<LoginResponse> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new ApiError('Please verify your email before logging in', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password', 401);
    }

    if (!jwtConfig.jwt.secret) {
      throw new ApiError('JWT secret not configured', 500);
    }

    const userId = (user._id as Types.ObjectId).toString();

    const accessToken = jwt.sign(
      {
        id: userId,
        email: user.email,
        username: user.username,
        role: user.role,
      } as AccessTokenPayload,
      jwtConfig.jwt.secret!,
      { expiresIn: jwtConfig.jwt.accessTokenExpiration },
    );

    const refreshToken = jwt.sign(
      {
        id: userId,
        role: user.role,
      } as RefreshTokenPayload,
      jwtConfig.jwt.secret!,
      { expiresIn: jwtConfig.jwt.refreshTokenExpiration },
    );

    return {
      success: true,
      user: user.toCleanObject(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new ApiError('Refresh token is required and must be a string', 400);
    }

    if (!jwtConfig.jwt.secret) {
      throw new ApiError('JWT secret not configured', 500);
    }

    let decoded: JwtPayload | string;
    try {
      decoded = jwt.verify(refreshToken, jwtConfig.jwt.secret);
      if (typeof decoded === 'string') {
        throw new ApiError('Invalid refresh token format', 401);
      }
    } catch (error) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError('User not found', 401);
    }

    const userId = (user._id as Types.ObjectId).toString();

    const accessToken = jwt.sign(
      {
        id: userId,
        email: user.email,
        username: user.username,
        role: user.role,
      } as AccessTokenPayload,
      jwtConfig.jwt.secret!,
      { expiresIn: jwtConfig.jwt.accessTokenExpiration },
    );

    const newRefreshToken = jwt.sign(
      {
        id: userId,
        role: user.role,
      } as RefreshTokenPayload,
      jwtConfig.jwt.secret!,
      { expiresIn: jwtConfig.jwt.refreshTokenExpiration },
    );

    return {
      success: true,
      user: user.toCleanObject(),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async forgotPassword(email: string): Promise<{ success: boolean }> {
    const user = await User.findOne({ email });

    if (!user) {
      return { success: true };
    }

    const now = Date.now();
    if (user.passwordResetCodeExpires && user.passwordResetCodeExpires.getTime() > now) {
      const timeSinceLastRequest = now - (user.passwordResetCodeExpires.getTime() - 15 * 60 * 1000);
      if (timeSinceLastRequest < 2 * 60 * 1000) {
        throw new ApiError('Please wait before requesting another reset code', 429);
      }
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.passwordResetCode = hashedCode;
    user.passwordResetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.passwordResetAttempts = 0;
    user.passwordResetAttemptsExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const emailBody = `
  <div style="text-align: center; font-family: Arial, sans-serif;">
    <h1>Password Reset Request</h1>
    <p>Hello ${user.username},</p>
    <p>You requested to reset your password. Use the code below:</p>
    <h2 style="color: #4CAF50; letter-spacing: 5px;">${resetCode}</h2>
    <p>This code is valid for <strong>15 minutes</strong>.</p>
    <p>If you didn't request this, please ignore this email and secure your account.</p>
  </div>
`;

    try {
      await sendMail({
        recipientEmail: user.email,
        subject: 'Password Reset Code',
        emailBody,
      });
    } catch (error) {
      user.passwordResetCode = undefined;
      user.passwordResetCodeExpires = undefined;
      user.passwordResetAttempts = undefined;
      user.passwordResetAttemptsExpires = undefined;
      await user.save();
      throw new ApiError('Failed to send password reset email', 500);
    }

    return { success: true };
  }

  static async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new ApiError('Passwords do not match', 400);
    }

    if (newPassword.length < 6) {
      throw new ApiError('Password must be at least 6 characters long', 400);
    }

    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    const user: IUser | null = await User.findOne({
      email: email.toLowerCase(),
      passwordResetCodeExpires: { $gt: Date.now() },
    }).select('+password +passwordResetCode');

    if (!user) {
      throw new ApiError('Invalid or expired reset code', 400);
    }

    if (
      user.passwordResetAttemptsExpires &&
      user.passwordResetAttemptsExpires.getTime() > Date.now()
    ) {
      if (user.passwordResetAttempts && user.passwordResetAttempts >= 5) {
        throw new ApiError('Too many failed attempts. Please request a new code', 429);
      }
    } else {
      user.passwordResetAttempts = 0;
      user.passwordResetAttemptsExpires = new Date(Date.now() + 15 * 60 * 1000);
    }

    if (user.passwordResetCode !== hashedCode) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      await user.save();

      const remainingAttempts = 5 - user.passwordResetAttempts;
      throw new ApiError(`Invalid reset code. ${remainingAttempts} attempts remaining`, 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ApiError('New password cannot be the same as the old password', 400);
    }

    user.password = newPassword;

    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetAttempts = undefined;
    user.passwordResetAttemptsExpires = undefined;

    await user.save();

    try {
      await sendMail({
        recipientEmail: user.email,
        subject: 'Password Reset Successful',
        emailBody: `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <h1>Password Changed</h1>
        <p>Hello ${user.username},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>
    `,
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }
}
