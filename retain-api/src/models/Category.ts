import { model, Schema, type InferSchemaType } from 'mongoose';
import { cleanJSON } from './toJSON';

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  // true only for "Uncategorized", the fallback for expenses of deleted categories
  isDefault: { type: Boolean, default: false },
});

// unique names where case doesn't count: "Travel" and "travel" clash (strength 2 ignores case)
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

cleanJSON(categorySchema);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
