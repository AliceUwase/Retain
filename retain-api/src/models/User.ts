import { model, Schema, type InferSchemaType } from 'mongoose';
import { cleanJSON } from './toJSON';

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false leaves the hash out of every query unless it's asked for by name (only login does)
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
  },
  { timestamps: true }, // createdAt and updatedAt, kept up to date by Mongoose
);

// select: false only covers queries; this also hides the hash on a user that was just created or loaded for login
cleanJSON(userSchema, ['passwordHash']);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
