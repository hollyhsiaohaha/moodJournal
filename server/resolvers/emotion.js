import OpenAI from 'openai';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import { Feelings, Factors, prompt } from '../models/Emotion.js';

const { OPENAI_API_KEY, OPENAI_API_MODEL } = process.env;
const awsComprehendClient = new ComprehendClient({ region: 'ap-northeast-2' });
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const emotionResolver = {
  Query: {
    async getFeelings() {
      return Feelings;
    },
    async getFactors() {
      return Factors;
    },
    async sentimentAnalysisOpenAi(_, { journalContent }) {
      try {
        const chatCompletion = await openai.chat.completions.create({
          response_format: { type: 'json_object' },
          messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: journalContent },
          ],
          model: OPENAI_API_MODEL,
          temperature: 0,
          seed: 12,
        });
        const res = chatCompletion.choices[0].message.content;
        logger.info('sentiment response from open ai');
        logger.info(res);
        return JSON.parse(res);
      } catch (error) {
        logger.error(error.stack);
        throwCustomError(error.message, ErrorTypes.INTERNAL_SERVER_ERROR);
      }
    },
    async sentimentAnalysis(_, { journalContent }) {
      try {
        const input = {
          Text: journalContent,
          LanguageCode: 'zh-TW',
        };
        const command = new DetectSentimentCommand(input);
        const awsComprehendResponse = await awsComprehendClient.send(command);
        const sentimentScore = awsComprehendResponse.SentimentScore;
        if (!sentimentScore)
          throwCustomError(
            'sentimentScore analysis fail',
            ErrorTypes.BAD_INTERNAL_SERVER_ERRORREQUEST,
          );
        const weights = {
          Positive: 2,
          Negative: -2,
          Neutral: 0.5,
          Mixed: 0.5,
        };
        let weightedScore = 0;
        for (const emotion in sentimentScore) {
          weightedScore += sentimentScore[emotion] * weights[emotion];
        }
        let score = ((weightedScore + 2) / 4) * 9 + 1;
        score = Math.floor(Math.max(1, Math.min(10, score)));

        // fecht Worker api for sentiment feeling and factor
        const config = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ text: journalContent }),
        };
        const res = await fetch('http://localhost:5000/get_feelings_and_factors', config);
        const data = await res.json(); // { feeling:[], factor:[] }
        if (!data)
          throwCustomError(
            'feeling, factor analysis fail',
            ErrorTypes.BAD_INTERNAL_SERVER_ERRORREQUEST,
          );
        return { score, ...data };
      } catch (error) {
        logger.error(error.stack);
        throwCustomError(error.message, ErrorTypes.BAD_INTERNAL_SERVER_ERRORREQUEST);
      }
    },
  },
};

export default emotionResolver;
