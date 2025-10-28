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

// export const getAllExpenses = asyncHandler(async (req: Request, res: Response) => {
//   const user = (req as any).user;
//   if (!user) {
//     throw new ApiError('Unauthorized, user not found', 401);
//   }
//   const result = await ExpenseService.getAllExpenses(user.id, user.role);
//   return ApiResponse.success(res, 'Expenses fetched successfully', result);
// });

// export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const user = (req as any).user;
//   if (!user) {
//     throw new ApiError('Unauthorized, user not found', 401);
//   }
//   const result = await ExpenseService.getExpenseById(id, user.id, user.role);
//   return ApiResponse.success(res, 'Expense fetched successfully', result);
// });

// export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const user = (req as any).user;
//   if (!user) {
//     throw new ApiError('Unauthorized, user not found', 401);
//   }
//   const result = await ExpenseService.updateExpense(id, req.body, user.id, user.role);
//   return ApiResponse.success(res, 'Expense updated successfully', result);
// });

// export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const user = (req as any).user;
//   if (!user) {
//     throw new ApiError('Unauthorized, user not found', 401);
//   }
//   await ExpenseService.deleteExpense(id, user.id, user.role);
//   return ApiResponse.success(res, 'Expense deleted successfully', {});
// });

export const filterExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { customer, from, to, item, page, limit } = req.query;
  const user = (req as any).user;

  if (!user) {
    throw new ApiError('Unauthorized, user not found', 401);
  }

  const expenses = await ExpenseService.filterExpenses({
    customer: customer as string,
    from: from as string,
    to: to as string,
    item: item as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 10,
    userId: user.id,
    role: user.role,
  });

  return ApiResponse.success(res, 'Expenses filtered successfully', expenses);
});
