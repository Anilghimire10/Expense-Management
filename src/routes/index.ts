import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import expenseRoutes from './expenseRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/expense', expenseRoutes);
module.exports = router;
