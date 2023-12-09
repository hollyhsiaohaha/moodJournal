import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import cookiesParser from 'cookie-parser';
import morganBody from 'morgan-body';
import { fileURLToPath } from 'url';
import { ApolloServer } from 'apollo-server-express';
import multer from 'multer';
import { logger } from './utils/logger.js';
import { connectDB } from './utils/db.js';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './resolvers/resolvers.js';
import context from './context/context.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server } from 'socket.io';

dotenv.config();
const filename = fileURLToPath(import.meta.url);
const workingDir = path.dirname(filename);

const s3Proxy = createProxyMiddleware({
  target: process.env.BUCKET_PUBLIC_PATH,
  changeOrigin: true,
  pathRewrite: (path) => path.replace('/assets', '/dist/assets'),
});

const indexProxy = createProxyMiddleware({
  target: process.env.BUCKET_PUBLIC_PATH,
  changeOrigin: true,
  pathRewrite: () => '/dist/index.html',
});

const app = express();
const port = process.env.PORT || 3000;
const log = fs.createWriteStream(path.join(workingDir, 'logs', 'request.log'), {
  flags: 'a',
});

// CORS setting for React and Apollo sandbox
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://studio.apollographql.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookiesParser());
app.use(express.json());
morganBody(app, {
  noColors: true,
  stream: log,
});

// define statics path
app.use('/assets', s3Proxy);
app.use('/static', express.static(path.join(workingDir, 'public')));
app.set('views', path.join(workingDir, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');

import apiRoutes from './routes/api.js';
app.use('/api', apiRoutes);

connectDB();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context,
});
await apolloServer.start();
apolloServer.applyMiddleware({ app });

app.get('*', indexProxy);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: err.code, message: 'File is too large' });
    }
    if (err.code === 'UNEXPECTED_FILE_TYPE') {
      return res.status(400).json({ error: err.code, message: 'File type must be audio' });
    }
  }
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.stack,
  });
});

const server = app.listen(port, () => {
  logger.info(`This app is listening to localhost: ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // The client URL
    methods: ['GET', 'POST'],
  },
});
app.set('socketio', io);
io.on('connection', (socket) => {
  logger.info('[Server] a user connected');
  socket.on('disconnect', () => {
    logger.info('[Server] a user disconnected');
  });
  socket.on('connect_error', (err) => {
    logger.error(`[Server] connect_error due to ${err.message}`);
  });
});
