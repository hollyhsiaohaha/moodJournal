import { Feelings, Factors } from '../models/Emotion.js';

const emotionResolver = {
  Query: {
    async getFeelings() {
      return Feelings;
    },
    async getFactors() {
      return Factors;
    },
  },
};

export default emotionResolver;
