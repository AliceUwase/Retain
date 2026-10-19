import { rateLimit } from 'express-rate-limit';

// counts are kept per visitor IP address, in the server's memory, so they reset when the server restarts

// 10 failed logins per 15 minutes; successful logins aren't counted, so a real user never gets blocked
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8', // tells the client its limit in a "RateLimit" header
  legacyHeaders: false,
  message: { error: 'Too many failed logins. Try again in 15 minutes.' },
});

// 5 new accounts per hour from one address, which stops scripts from creating accounts in bulk
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many accounts created. Try again in an hour.' },
});
