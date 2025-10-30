import { Request, Response } from 'express';
import { ExpenseService } from '../services/expenseService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    throw new ApiError('Unauthorized, user not found', 401);
  }
  const result = await ExpenseService.createExpense(req.body, user.id);
  return ApiResponse.success(res, 'Expense created successfully', result);
});

export const filterExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { customer, from, to, item, category, page, limit } = req.query;
  const user = (req as any).user;

  if (!user) {
    throw new ApiError('Unauthorized, user not found', 401);
  }

  const expenses = await ExpenseService.filterExpenses({
    customer: customer as string,
    from: from as string,
    to: to as string,
    item: item as string,
    category: category as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
    userId: user.id,
    role: user.role,
  });

  return ApiResponse.success(res, 'Expenses filtered successfully', expenses);
});

export const getExpensesCategories = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.user;
  const { customerId } = req.query;

  const categories = await ExpenseService.getCategories(admin?.id, customerId as string);

  return ApiResponse.success(res, 'Categories fetched successfully', categories);
});
