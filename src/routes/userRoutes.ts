import express from 'express';
import { createUserByAdmin } from '../controller/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create', authMiddleware(['admin']), createUserByAdmin);

export default router;
