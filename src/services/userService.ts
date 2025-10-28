import crypto from 'crypto';
import { User } from '../models/userModel';
import { ApiError } from '../utils/apiError';
import { sendMail } from '../utils/mailHandler';

export class UserService {
  static async createUserByAdmin(data: {
    username: string;
    email: string;
    phone?: string;
    createdBy: string;
  }) {
    const { username, email, phone, createdBy } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError('User already exists with this email', 400);
    }

    const randomPassword = crypto.randomBytes(5).toString('hex');

    try {
      const newUser = await User.create({
        username,
        email,
        phoneNumber: phone,
        password: randomPassword,
        isVerified: true,
        role: 'user',
        createdBy,
      });

      const emailBody = `
        <h2>Welcome to Our Platform, ${username}!</h2>
        <p>Your account has been created by the admin.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        `;
      // <p>Please login and change your password for security.</p>

      await sendMail({
        recipientEmail: email,
        subject: 'Your New Account Details',
        emailBody,
      });

      // Prepare response object
      const userObject = newUser.toObject() as any;
      delete userObject.password;
      delete userObject.refreshToken;

      return {
        success: true,
        message: 'User created successfully and credentials sent via email',
        user: userObject,
      };
    } catch (error: any) {
      if (error.message.includes('send') || error.message.includes('mail')) {
        await User.deleteOne({ email });
      }

      throw new ApiError('Failed to create user or send email', 500);
    }
  }
}
