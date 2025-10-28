import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isVerified: boolean;
  verificationCodeExpires?: Date;
  verificationCode?: string;
  role: 'user' | 'admin';
  image?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  passwordResetCode?: string;
  passwordResetCodeExpires?: Date;
  passwordResetAttempts?: number;
  passwordResetAttemptsExpires?: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetCodeExpires: {
      type: Date,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetAttemptsExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'admin',
    },
    image: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.toCleanObject = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.verificationCode;
  delete userObject.verificationCodeExpires;
  delete userObject.passwordResetCode;
  delete userObject.passwordResetCodeExpires;
  delete userObject.passwordResetAttempts;
  delete userObject.passwordResetAttemptsExpires;
  delete userObject.__v;

  return userObject;
};

export interface IUser extends Document {
  toCleanObject(): any;
}

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
