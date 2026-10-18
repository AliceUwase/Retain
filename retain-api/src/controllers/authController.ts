import type { Request, Response } from 'express';
import { User } from '../models/User';
import type { LoginInput, RegisterInput } from '../schemas/authSchemas';
import { HttpError } from '../utils/HttpError';
import { checkPassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/token';

// POST /api/auth/register: new accounts are always normal users, and logged in straight away
export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body as RegisterInput;

  if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists.');

  const user = await User.create({ name, email, passwordHash: await hashPassword(password) });
  res.status(201).json({ user, token: signToken({ id: user.id, role: user.role }, true) });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password, remember } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+passwordHash'); // the hash is left out by default
  // one message for both cases, so the response doesn't reveal which emails have accounts
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Incorrect email or password.');
  }

  res.json({ user, token: signToken({ id: user.id, role: user.role }, remember) });
}

// GET /api/auth/me: who the token belongs to, used to restore a session on page load
export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id); // requireAuth already set req.user
  if (!user) throw new HttpError(401, 'This account no longer exists.');
  res.json({ user });
}
