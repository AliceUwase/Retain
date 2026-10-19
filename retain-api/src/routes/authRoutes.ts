import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../middleware/rateLimits';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const router = Router();

// each route lists its checks in order, then the controller; the limit comes first so blocked requests do no work
router.post('/register', registerLimiter, validateBody(registerSchema), register);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
