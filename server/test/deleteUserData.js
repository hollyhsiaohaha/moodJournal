import { connectDB } from '../utils/db.js';
import { Journal } from '../models/Journal.js';
import { testUsers } from './testConf.js';
import dotenv from 'dotenv';

dotenv.config();
connectDB();

for (const userId of testUsers) {
  Journal.deleteMany({ userId }).then((res) => console.log(res));
}
