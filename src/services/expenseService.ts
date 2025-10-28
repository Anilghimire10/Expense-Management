import mongoose, { Document } from 'mongoose';
import { Expense, ExpenseDocument } from '../models/expenseModel';

interface FilterExpensesParams {
  customer?: string;
  from?: string;
  to?: string;
  item?: string;
  userId: string;
  role: string;
}

export class ExpenseService {
  static async createExpense(data: Partial<ExpenseDocument>, userId: string) {
    const expenseData = {
      ...data,
      createdBy: userId,
    };
    const expense = await Expense.create(expenseData);
    return expense;
  }

  // static async getAllExpenses(userId: string, role: string) {
  //   const filter: any = {};

  //   if (role === 'admin') {
  //     filter.createdBy = userId;
  //   } else {
  //     filter.customer = userId;
  //   }

  //   const expenses = await Expense.find(filter)
  //     .sort({ createdAt: -1 })
  //     .populate('customer', 'username email')
  //     .populate('createdBy', 'username email');
  //   return expenses;
  // }

  //   static async getExpenseById(id: string, userId: string, role: string) {
  //     const filter: any = { _id: id };

  //     if (role === 'admin') {
  //       filter.createdBy = userId; // Ensure admin only accesses their own expenses
  //     } else {
  //       filter.customer = userId; // Users access their own expenses
  //     }

  //     const expense = await Expense.findOne(filter).populate('customer', 'username email');
  //     if (!expense) throw new ApiError('Expense not found or unauthorized', 404);
  //     return expense;
  //   }

  //   static async updateExpense(
  //     id: string,
  //     data: Partial<ExpenseDocument>,
  //     userId: string,
  //     role: string,
  //   ) {
  //     const filter: any = { _id: id };

  //     if (role === 'admin') {
  //       filter.createdBy = userId;
  //     } else {
  //       filter.customer = userId;
  //     }

  //     const expense = await Expense.findOne(filter);
  //     if (!expense) throw new ApiError('Expense not found or unauthorized', 404);

  //     Object.assign(expense, data);
  //     await expense.save();
  //     return expense;
  //   }

  //   static async deleteExpense(id: string, userId: string, role: string) {
  //     const filter: any = { _id: id };

  //     if (role === 'admin') {
  //       filter.createdBy = userId;
  //     } else {
  //       filter.customer = userId;
  //     }

  //     const deleted = await Expense.findOneAndDelete(filter);
  //     if (!deleted) throw new ApiError('Expense not found or unauthorized', 404);
  //     return deleted;
  //  }

  static filterExpenses = async (
    params: FilterExpensesParams & { page?: number; limit?: number },
  ) => {
    const { customer, from, to, item, userId, role, page = 1, limit = 10 } = params;

    const matchStage: any = {};

    if (role !== 'admin') {
      matchStage.createdBy = new mongoose.Types.ObjectId(userId);
    }

    if (customer) {
      if (!mongoose.Types.ObjectId.isValid(customer)) {
        throw new Error('Invalid customer ID');
      }
      matchStage.customer = new mongoose.Types.ObjectId(customer);
    }

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const pipeline: any[] = [{ $match: matchStage }, { $unwind: '$expenseItems' }];

    if (item) {
      pipeline.push({
        $match: { 'expenseItems.name': { $regex: item, $options: 'i' } },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData',
          pipeline: [{ $project: { username: 1, _id: 0 } }],
        },
      },
      { $unwind: { path: '$customerData', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          normalizedItem: { $toLower: { $trim: { input: '$expenseItems.name' } } },
          saleDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: {
            itemName: '$normalizedItem',
            date: '$saleDate',
            customer: '$customerData.username',
          },
          itemName: { $first: '$expenseItems.name' },
          price: { $first: '$expenseItems.rate' },
          category: { $first: '$category' },
          count: { $sum: '$expenseItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$expenseItems.quantity', '$expenseItems.rate'] } },
          discount: { $first: '$discount' },
          date: { $first: '$saleDate' },
          customerName: { $first: '$customerData.username' },
        },
      },
      { $sort: { date: -1, itemName: 1 } },
      // Facet to get both data and total count
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                itemName: 1,
                price: 1,
                category: 1,
                count: 1,
                totalRevenue: 1,
                discount: 1,
                date: 1,
                customerName: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    );

    const result = await Expense.aggregate(pipeline);

    const items = result[0].data;
    const totalItems = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      page,
      limit,
      totalItems,
      totalPages,
    };
  };

  // static filterExpenses = async (
  //   params: FilterExpensesParams & { page?: number; limit?: number },
  // ) => {
  //   const { customer, from, to, item, userId, role, page = 1, limit = 10 } = params;

  //   const matchStage: any = {};

  //   if (role !== 'admin') {
  //     matchStage.createdBy = new mongoose.Types.ObjectId(userId);
  //   }

  //   if (customer) {
  //     if (!mongoose.Types.ObjectId.isValid(customer)) {
  //       throw new Error('Invalid customer ID');
  //     }
  //     matchStage.customer = new mongoose.Types.ObjectId(customer);
  //   }

  //   if (from || to) {
  //     matchStage.createdAt = {};
  //     if (from) matchStage.createdAt.$gte = new Date(from);
  //     if (to) matchStage.createdAt.$lte = new Date(to);
  //   }

  //   const pipeline: any[] = [{ $match: matchStage }, { $unwind: '$expenseItems' }];

  //   if (item) {
  //     pipeline.push({
  //       $match: {
  //         'expenseItems.name': { $regex: item, $options: 'i' },
  //       },
  //     });
  //   }

  //   pipeline.push(
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'customer',
  //         foreignField: '_id',
  //         as: 'customerData',
  //         pipeline: [{ $project: { username: 1, _id: 0 } }],
  //       },
  //     },
  //     { $unwind: { path: '$customerData', preserveNullAndEmptyArrays: true } },
  //     {
  //       $addFields: {
  //         normalizedItem: { $toLower: { $trim: { input: '$expenseItems.name' } } },
  //         saleDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: {
  //           itemName: '$normalizedItem',
  //           date: '$saleDate',
  //           customer: '$customerData.username',
  //         },
  //         itemName: { $first: '$expenseItems.name' },
  //         price: { $first: '$expenseItems.rate' },
  //         category: { $first: '$category' },
  //         count: { $sum: '$expenseItems.quantity' },
  //         totalRevenue: { $sum: { $multiply: ['$expenseItems.quantity', '$expenseItems.rate'] } },
  //         discount: { $first: '$discount' },
  //         date: { $first: '$saleDate' },
  //         customerName: { $first: '$customerData.username' },
  //       },
  //     },
  //     { $sort: { date: -1, itemName: 1 } },
  //   );

  //   // Pagination using skip and limit
  //   const skip = (page - 1) * limit;
  //   pipeline.push({ $skip: skip }, { $limit: limit });

  //   // Final projection
  //   pipeline.push({
  //     $project: {
  //       _id: 0,
  //       itemName: 1,
  //       price: 1,
  //       category: 1,
  //       count: 1,
  //       totalRevenue: 1,
  //       discount: 1,
  //       date: 1,
  //       customerName: 1,
  //     },
  //   });

  //   const items = await Expense.aggregate(pipeline);
  //   return items;
  // };
}
