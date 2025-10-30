import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createExpense,
  filterExpenses,
  getExpensesCategories,
} from '../controller/expenseController';
import { validateRequest } from '../middlewares/validateRequest';
import { createExpenseSchema } from '../validations/expenseValidation';

const router = express.Router();

router.post(
  '/',
  validateRequest(createExpenseSchema),
  authMiddleware(['admin', 'user']),
  createExpense,
);
router.get('/', authMiddleware(['admin']), filterExpenses);
router.get('/category', authMiddleware(['admin', 'user']), getExpensesCategories);

export default router;
