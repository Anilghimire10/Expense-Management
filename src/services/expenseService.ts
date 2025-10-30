import mongoose, { Document } from 'mongoose';
import { Expense, ExpenseDocument } from '../models/expenseModel';

interface FilterExpensesParams {
  customer?: string;
  from?: string;
  to?: string;
  category?: string;
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

  static async getCategories(adminId: string, customerId?: string): Promise<string[]> {
    const filter: any = { createdBy: adminId };

    if (customerId) {
      filter.customer = customerId;
    }

    const categories = await Expense.distinct('category', filter);
    return categories;
  }

  static async filterExpenses(params: FilterExpensesParams & { page?: number; limit?: number }) {
    const { customer, from, to, item, category, userId, role, page = 1, limit = 10 } = params;

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

    if (category) {
      matchStage.category = { $regex: category, $options: 'i' };
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
          saleDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: {
            customer: '$customerData.username',
            category: '$category',
            itemName: '$expenseItems.name',
          },
          itemName: { $first: '$expenseItems.name' },
          price: { $first: '$expenseItems.rate' },
          category: { $first: '$category' },
          count: { $sum: '$expenseItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$expenseItems.quantity', '$expenseItems.rate'] } },
          discount: { $first: '$discount' },
          customerName: { $first: '$customerData.username' },
          date: { $first: '$saleDate' },
        },
      },
      { $sort: { customerName: 1, category: 1, itemName: 1 } },
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

    // Chart pipeline
    const chart = await Expense.aggregate([
      { $match: matchStage },
      { $unwind: '$expenseItems' },
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: { $multiply: ['$expenseItems.quantity', '$expenseItems.rate'] } },
          count: { $sum: '$expenseItems.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalRevenue: 1,
          count: 1,
        },
      },
    ]);

    return {
      items,
      chart,
      page,
      limit,
      totalItems,
      totalPages,
    };
  }
}
