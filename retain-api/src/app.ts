import express from 'express';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(express.json()); // turns JSON request bodies into req.body

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
