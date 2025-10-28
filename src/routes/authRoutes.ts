import express from 'express';
import {
  forgotPassword,
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  verifyEmail,
} from '../controller/authController';
import upload from '../utils/multer';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema, registerSchema } from '../validations/userValidations';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), upload.single('image'), registerUser);
router.post('/verifyEmail', verifyEmail);
router.post('/login', validateRequest(loginSchema), loginUser);
router.post('/refreshToken', refreshToken);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

export default router;
