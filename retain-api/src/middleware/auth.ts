import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { verifyToken } from '../utils/token';

// reads "Authorization: Bearer <token>" and sets req.user, or answers 401
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) throw new HttpError(401, 'Please log in.');

  try {
    req.user = verifyToken(token);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }
  next();
}

// runs after requireAuth; 403 means "logged in, but not allowed here"
export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) throw new HttpError(403, "You don't have access to this.");
    next();
  };
}
