import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { isDBConnected } from './config/db';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import budgetRoutes from './routes/budgetRoutes';
import categoryRoutes from './routes/categoryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import expenseRoutes from './routes/expenseRoutes';

const app = express();

// Render sits in front of the app as a proxy; trusting one proxy lets req.ip be the visitor's real address
// instead of Render's, which the rate limits on login and register depend on
app.set('trust proxy', 1);

app.use(helmet()); // adds safe HTTP headers and removes the "X-Powered-By: Express" header
// browsers only let these websites call the API
app.use(cors({ origin: env.clientUrls }));
app.use(express.json({ limit: '10kb' })); // turns JSON request bodies into req.body

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: isDBConnected() ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
