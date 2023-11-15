import path from 'path';
import winston from 'winston';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(path.join(path.dirname(path.dirname(__filename)), 'logs', 'express.log')),
    }),
  ],
});
