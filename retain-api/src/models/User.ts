import { model, Schema, type InferSchemaType } from 'mongoose';
import { cleanJSON } from './toJSON';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false leaves the hash out of every query unless it's asked for by name (only login does)
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }, // createdAt and updatedAt, kept up to date by Mongoose
);

cleanJSON(userSchema);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
