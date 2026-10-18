import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log(`Connected to MongoDB, database "${mongoose.connection.name}"`);
}

// readyState 1 means the connection is open
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
