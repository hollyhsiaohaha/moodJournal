import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import { Feelings, Factors, prompt } from '../models/Emotion.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const emotionResolver = {
  Query: {
    async getFeelings() {
      return Feelings;
    },
    async getFactors() {
      return Factors;
    },
    async sentimentAnalysis(_, { journalContent }) {
      try {
        const chatCompletion = await openai.chat.completions.create({
          response_format: { type: 'json_object' },
          messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: journalContent },
          ],
          model: 'gpt-4-1106-preview',
          temperature: 0.1,
          seed: 12,
        });
        const res = chatCompletion.choices[0].message.content;
        logger.info('sentiment response from open ai');
        logger.info(res);
        return JSON.parse(res);
      } catch (error) {
        logger.error(error.stack);
        throwCustomError(error.message, ErrorTypes.BAD_REQUEST);
      }
    },
  },
};

export default emotionResolver;
