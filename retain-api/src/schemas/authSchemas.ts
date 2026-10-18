import { z } from 'zod';

const email = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address.')); // trim and lowercase first, then check the format

export const registerSchema = z.object({
  name: z.string({ error: 'Name is required.' }).trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
  email,
  // bcrypt only uses the first 72 bytes of a password, so longer ones are refused instead of silently cut
  password: z
    .string({ error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.'),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
  remember: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
