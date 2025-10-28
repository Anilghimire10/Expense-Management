import Joi from 'joi';
import mongoose from 'mongoose';

const objectId = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  })
  .message('Invalid ObjectId');

const expenseItemSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Expense item name is required',
  }),
  quantity: Joi.number().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  rate: Joi.number().min(0).required().messages({
    'number.min': 'Rate cannot be negative',
    'any.required': 'Rate is required',
  }),
});

export const createExpenseSchema = Joi.object({
  customer: objectId.required().messages({
    'any.required': 'Customer is required',
  }),
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required',
  }),
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required',
  }),
  expenseItems: Joi.array().items(expenseItemSchema).min(1).required().messages({
    'array.min': 'At least one expense item is required',
    'any.required': 'Expense items are required',
  }),
  vat: Joi.number().min(0).default(0).messages({
    'number.min': 'VAT cannot be negative',
  }),
  discount: Joi.number().min(0).default(0).messages({
    'number.min': 'Discount cannot be negative',
  }),
  createdBy: objectId.required().messages({
    'any.required': 'CreatedBy user is required',
  }),
});
