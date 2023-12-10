import { mergeTypeDefs } from '@graphql-tools/merge';
import userTypeDef from './user.js';
import journalTypeDef from './journal.js';
import emotionTypeDef from './emotion.js';
import audioTypeDef from './audio.js';
import chartTypeDef from './chart.js';
import cacheTypeDef from './cache.js';

export default mergeTypeDefs([
  userTypeDef,
  journalTypeDef,
  emotionTypeDef,
  audioTypeDef,
  chartTypeDef,
  cacheTypeDef,
]);
