import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

// the database connects first, so no request ever arrives before the data is reachable
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); // exit code 1 tells Render the start failed
  }

  app.listen(env.port, () => {
    console.log(`Retain API running on http://localhost:${env.port}`);
  });
}

start();
