import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import expenseRoutes from './expenseRoutes';
import ocrRoutes from './ocrRoutes';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/expense', expenseRoutes);
router.use('/ocr', ocrRoutes);

export default router;
