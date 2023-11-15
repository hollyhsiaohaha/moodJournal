import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
};
