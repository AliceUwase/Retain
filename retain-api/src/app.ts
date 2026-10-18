import express from 'express';
import { isDBConnected } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(express.json()); // turns JSON request bodies into req.body

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: isDBConnected() ? 'connected' : 'disconnected' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
