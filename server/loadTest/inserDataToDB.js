import { connectDB } from '../utils/db.js';
import { Journal } from '../models/Journal.js';
import { testUsers } from './testConf.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
connectDB();

// 30 rows * 11 months
const diaryFile = JSON.parse(fs.readFileSync('./test/diaryData.json', 'utf8'));
// 100 rows * 7
const noteFile = JSON.parse(fs.readFileSync('./test/noteData.json', 'utf8'));

const inserDataforUser = async (file, userId) => {
  for (const journal of file.data) {
    const { title, type, content, diaryDate, moodScore, moodFeelings, moodFactors } = journal;
    const newJournal = new Journal({
      title,
      type,
      content,
      userId,
      diaryDate: diaryDate,
      moodScore: moodScore,
      moodFeelings: moodFeelings || [],
      moodFactors: moodFactors || [],
      linkedNoteIds: [],
    });
    const res = await newJournal.save();
    console.log(res);
  }
};

for (const user of testUsers) {
  setTimeout(() => {
    inserDataforUser(diaryFile, user);
    inserDataforUser(noteFile, user);
  }, 1000);
}
