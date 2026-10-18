import type { TokenUser } from '../utils/token';

// adds req.user to Express's Request type; requireAuth fills it in from the token
declare global {
  namespace Express {
    interface Request {
      user?: TokenUser;
    }
  }
}

export {};
