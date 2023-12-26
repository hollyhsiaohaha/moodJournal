import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import { feelingOptions, factorOptions } from '../models/Emotion.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const notePrompt = `
  {
    title: string,
    type: 'note'
    content: string(within 50 chinesse word),
  }
                `;

const diaryPrompt = `
  {
    title: date (non duplicate date in yyyy-mm-dd),
    type: 'diary'
    content: string(within 50 chinesse word),
    diaryDate: string (same as title)
    moodScore: int (1 - 10),
    moodFactors: [enum] (pick 1 from ${factorOptions}),
    moodFeelings: [enum] (pick 1 from ${feelingOptions}),
  }
`;

const generateJournalsAi = async (type, amount) => {
  let prompt;
  type === 'diary' ? (prompt = diaryPrompt) : (prompt = notePrompt);
  const chatCompletion = await openai.chat.completions.create({
    response_format: { type: 'json_object' },
    model: 'gpt-3.5-turbo-1106',
    messages: [
      {
        role: 'user',
        content: `請幫我依照以下的格式建立 ${amount} 筆假資料。並使用 json 格式回應我。
                  筆記名稱分別為 第五十一筆資料 ~ 第一百筆資料
                  回應方式為一個包含 journal object 的 array，格式如 {data : [journal object]}
                  而 journal object 格式如下。`,
      },
      { role: 'user', content: prompt },
    ],
  });
  const res = chatCompletion.choices[0].message.content;
  return JSON.parse(res);
};

const storeDataToJson = async () => {
  const jsonNoteData = await generateJournalsAi('note', 50);
  fs.writeFile('./test/note.json', JSON.stringify(jsonNoteData), function (err) {
    if (err) console.log(err);
  });
};

storeDataToJson();
