import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/HttpError';

// checks req.body against a zod schema; the route only runs if the body is valid
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new HttpError(400, result.error.issues[0].message); // the first problem is enough for a form
    }
    req.body = result.data; // the cleaned version: trimmed, lowercased, unknown fields removed
    next();
  };
}

// the same for the ?key=value part of the URL; in Express 5 req.query can't be replaced,
// so the cleaned values are stored in res.locals.query for the controller to read
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new HttpError(400, result.error.issues[0].message);
    }
    res.locals.query = result.data;
    next();
  };
}
