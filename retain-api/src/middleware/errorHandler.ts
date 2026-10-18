import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/HttpError';

// runs when no route matched
export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `No route for ${req.method} ${req.originalUrl}`));
}

// Express knows this is the error handler because it takes 4 arguments
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // express.json() throws this when the body isn't valid JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: "Request body isn't valid JSON." });
    return;
  }

  // anything else is unexpected; the details go to the server log, and in production the client only gets a generic message
  console.error(err);
  res.status(500).json({ error: env.nodeEnv === 'production' ? 'Something went wrong.' : String(err) });
}
