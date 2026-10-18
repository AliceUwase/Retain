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
