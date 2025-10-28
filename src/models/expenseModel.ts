import mongoose, { Document, Schema, Model, Types } from 'mongoose';

interface ExpenseItem {
  name: string;
  quantity: number;
  rate: number;
}

export interface ExpenseDocument extends Document {
  customer: Types.ObjectId;
  title: string;
  category: string;
  expenseItems: ExpenseItem[];
  vat: number;
  discount: number;
  subTotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ExpenseItemSchema = new Schema<ExpenseItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    expenseItems: { type: [ExpenseItemSchema], required: true },
    vat: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

// Automatically calculate subtotal and total before saving
ExpenseSchema.pre('save', function (next) {
  const subTotal = this.expenseItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

  this.subTotal = subTotal;

  // Apply discount (assuming it's percentage)
  // const afterDiscount = subTotal - (this.discount / 100) * subTotal;

  const afterDiscount = subTotal - this.discount;

  // Apply VAT (percentage)
  const total = afterDiscount + (this.vat / 100) * afterDiscount;

  this.total = total;

  next();
});

export const Expense: Model<ExpenseDocument> =
  mongoose.models.Expense || mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
