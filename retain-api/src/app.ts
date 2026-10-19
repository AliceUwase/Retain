import express from 'express';
import { isDBConnected } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import budgetRoutes from './routes/budgetRoutes';
import categoryRoutes from './routes/categoryRoutes';
import expenseRoutes from './routes/expenseRoutes';

const app = express();

app.use(express.json()); // turns JSON request bodies into req.body

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: isDBConnected() ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
