import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createExpense,
  //   deleteExpense,
  filterExpenses,
  // getAllExpenses,
  //   getExpenseById,
  //   updateExpense,
} from '../controller/expenseController';

const router = express.Router();

router.post('/', authMiddleware(['admin']), createExpense);
// router.get('/', authMiddleware(['admin']), getAllExpenses);
router.get('/', authMiddleware(['admin']), filterExpenses);
// router.get('/:id', authMiddleware(['admin']), getExpenseById);
// router.put('/:id', authMiddleware(['admin']), updateExpense);
// router.delete('/:id', authMiddleware(['admin']), deleteExpense);
export default router;
