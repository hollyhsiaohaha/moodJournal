import Redis from 'ioredis';
const { REDIS_ENABLED } = process.env;

export const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  commandTimeout: 300,
};

if (process.env.ENV === 'prod') redisConfig.tls = {};

export const redisClient = Number(REDIS_ENABLED) ? new Redis(redisConfig) : null;
