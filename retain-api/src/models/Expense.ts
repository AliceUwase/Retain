import { model, Schema, type InferSchemaType } from 'mongoose';
import { cleanJSON } from './toJSON';

export const PAYMENT_METHODS = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'] as const;

const expenseSchema = new Schema(
  {
    // ref names the model the id points to, so populate() can swap the id for the full user later
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0.01 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    // kept as 'YYYY-MM-DD' text, like the frontend: a Date would shift by a day across time zones
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// the most common query is "this user's expenses, newest first", and this index makes it fast
expenseSchema.index({ userId: 1, date: -1 });

cleanJSON(expenseSchema);

export type ExpenseDoc = InferSchemaType<typeof expenseSchema>;
export const Expense = model('Expense', expenseSchema);
