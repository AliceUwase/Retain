import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../models/User';

export interface TokenUser {
  id: string;
  role: Role;
}

// "remember me" keeps you logged in for 30 days, otherwise the token runs out after a day
export function signToken(user: TokenUser, remember: boolean): string {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user.id, // stored as `sub`, the standard JWT field for "who this token belongs to"
    expiresIn: remember ? '30d' : '1d',
  });
}

// throws if the token was changed, signed with another secret, or has expired
export function verifyToken(token: string): TokenUser {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  if (typeof payload === 'string' || !payload.sub) throw new Error('Unexpected token payload');
  return { id: payload.sub, role: payload.role as Role };
}
