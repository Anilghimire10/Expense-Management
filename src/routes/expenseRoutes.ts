import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createExpense,
  filterExpenses,
  //   deleteExpense,
  // getAllExpenses,
  //   getExpenseById,
  //   updateExpense,
} from '../controller/expenseController';
import { validateRequest } from '../middlewares/validateRequest';
import { createExpenseSchema } from '../validations/expenseValidation';

const router = express.Router();

router.post('/', validateRequest(createExpenseSchema), authMiddleware(['admin']), createExpense);
router.get('/', authMiddleware(['admin']), filterExpenses);
// router.get('/', authMiddleware(['admin']), getAllExpenses);
// router.get('/:id', authMiddleware(['admin']), getExpenseById);
// router.put('/:id', authMiddleware(['admin']), updateExpense);
// router.delete('/:id', authMiddleware(['admin']), deleteExpense);
export default router;
