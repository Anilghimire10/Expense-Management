import express from 'express';
import { createUserByAdmin, deleteUser, getEmployee } from '../controller/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create', authMiddleware(['admin']), createUserByAdmin);
router.get('/', authMiddleware(['admin']), getEmployee);
router.delete('/:id', authMiddleware(['admin']), deleteUser);

export default router;
