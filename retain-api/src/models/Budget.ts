import { model, Schema, type InferSchemaType } from 'mongoose';
import { cleanJSON } from './toJSON';

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // 'YYYY-MM'
    amount: { type: Number, required: true, min: 0.01 },
  },
  { timestamps: true },
);

// one budget per user per month; setting it again replaces the old one
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

cleanJSON(budgetSchema);

export type BudgetDoc = InferSchemaType<typeof budgetSchema>;
export const Budget = model('Budget', budgetSchema);
