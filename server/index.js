import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import cookiesParser from 'cookie-parser';
import morganBody from 'morgan-body';
import { fileURLToPath } from 'url';
import { graphqlHTTP } from 'express-graphql';
import { logger } from './utils/logger.js';
import { connectDB } from './utils/db.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const workingDir = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const log = fs.createWriteStream(path.join(workingDir, 'logs', 'request.log'), {
  flags: 'a',
});

// CORS setting for React
app.use(
  cors({
    origin: 'http://localhost:8080/',
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
app.use(express.static(path.join(workingDir, 'build')));
app.use('/static', express.static(path.join(workingDir, 'public')));
app.set('views', path.join(workingDir, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');

connectDB();

// === graphQL server ===
// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema,
//     graphiql: process.env.NODE_ENV === 'development',
//   }),
// );

// === DB test ===
// --- user ---
// import { User } from './models/User.js';
// const user = new User({
//   name: 'test',
//   email: 'test@mail.com',
//   password: 'password',
// });
// user.save();

// --- feeling ---
// import { Feeling } from './models/Feeling.js';
// const feeling = new Feeling({
//   title: 'test',
//   category: 'tests_category',
// });
// feeling.save();

// --- Journal ---
// import { Journal } from './models/Journal.js';
// const journal = new Journal({
//   title: '更新測試',
//   type: 'diary',
//   content: '心好累',
//   userId: '6554ad56356f33259f15b103',
//   recordingPaths: ['aaa.mp3'],
//   linkedNoteIds: [],
//   // createdAt: { type: Date, default: Date.now },
//   // updatedAt: { type: Date, default: Date.now },
//   // diaryDate: { type: Date },
//   moodScore: 5,
//   moodFeelings: ['快樂', '驚喜'],
//   moodFactors: ['學習', '朋友'],
// });
// journal.save();

app.listen(port, () => {
  logger.info(`This app is listening to localhost: ${port}`);
});
