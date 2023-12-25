import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import {
  insertElasticSearch,
  deleteIndex,
  autoCompleteElasticSearch,
} from '../utils/elasticSearch.js';
import {
  Journal,
  getBackLinkeds,
  autoCompleteMongoAtlas,
  createSingleJournal,
  deleteSingleJournal,
  fullTextSearchJournals,
  updateSingleJournal,
} from '../models/Journal.js';

const REDIS_ENABLED = Number(process.env.REDIS_ENABLED);
const REDIS_EXPIRED = Number(process.env.REDIS_EXPIRED);
const ELASTIC_SEARCH_ENABLED = Number(process.env.ELASTIC_SEARCH_ENABLED);

// === helper functions ===

const cacheInvalid = async (key, client) => {
  REDIS_ENABLED && client?.status === 'ready' ? await client.del(key) : null;
};

const elasticSearchReload = async (userId) => {
  if (ELASTIC_SEARCH_ENABLED) {
    await deleteIndex(userId);
    const journals = await Journal.find({ userId });
    await insertElasticSearch(userId, journals);
  }
};

const journalMutation = async (userId, redisClient, io) => {
  await cacheInvalid(userId, redisClient);
  await elasticSearchReload(userId);
  io.emit('message', 'journal update');
};

// === resolvers ===
const journalCacheResolver = {
  Journal: {
    user: async (parent, _args, context) => {
      const { loaders } = context;
      const { journalUserLoader } = loaders;
      const user = await journalUserLoader.load(parent.userId);
      return user;
    },
    linkedNotes: async (parent, _args, context) => {
      const { loaders } = context;
      const { journalLinkLoader } = loaders;
      const journalPromises = parent.linkedNoteIds.map((id) => journalLinkLoader.load(id));
      return Promise.all(journalPromises);
    },
  },
  Query: {
    async getJournalbyId(_, { ID }, context) {
      const userId = context.user._id;
      const res = await Journal.findById(ID);
      if (!res || res.userId.toString() !== userId)
        throwCustomError('Journal not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
    },
    async getJournalbyTitle(_, { title }, context) {
      const userId = context.user._id;
      const res = await Journal.findOne({ userId, title }).exec();
      if (!res) throwCustomError('Title not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
    },
    async getJournalsbyUserId(_, _args, context) {
      const userId = context.user._id;
      const { redisClient } = context;
      if (!REDIS_ENABLED || redisClient?.status !== 'ready') return await Journal.find({ userId });
      const cacheRes = await redisClient.get(userId);
      if (cacheRes) {
        return JSON.parse(cacheRes).map((journal) => {
          return {
            _id: journal._id,
            title: journal.title,
            type: journal.type,
            content: journal.content,
            userId: journal.userId,
            linkedNoteIds: journal.linkedNoteIds,
            moodFeelings: journal.moodFeelings,
            moodFactors: journal.moodFactors,
            createdAt: new Date(journal.createdAt),
            updatedAt: new Date(journal.updatedAt),
          };
        });
      }
      const res = await Journal.find({ userId });
      await redisClient.set(userId, JSON.stringify(res), 'EX', REDIS_EXPIRED);
      return res;
    },
    async getUserLatestJournals(_, { amount, type }, context) {
      const userId = context.user._id;
      const res = await Journal.find({ userId, type }).sort({ updatedAt: -1 }).limit(amount);
      return res;
    },
    async getDiariesbyMonth(_, { month }, context) {
      const userId = context.user._id;
      const date = new Date(month);
      const y = date.getFullYear();
      const m = date.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 2);
      const res = await Journal.find({
        userId,
        diaryDate: { $gte: firstDay, $lte: lastDay },
      });
      return res;
    },
    async searchJournals(_, { keyword }, context) {
      const userId = context.user._id;
      const res = await fullTextSearchJournals(keyword, userId);
      return res;
    },
    async autoCompleteJournals(_, { keyword }, context) {
      const userId = context.user._id;
      if (!ELASTIC_SEARCH_ENABLED) return await autoCompleteMongoAtlas(userId, keyword);
      try {
        return await autoCompleteElasticSearch(userId, keyword);
      } catch (error) {
        if (error.message.includes('index_not_found_exception')) {
          return await autoCompleteMongoAtlas(userId, keyword);
        } else logger.error(error);
      }
    },
    async getBackLinkedJournals(_, { ID }, context) {
      const userId = context.user._id;
      const journal = await Journal.findById(ID);
      if (!journal || journal.userId.toString() !== userId)
        throwCustomError('Journal not exist', ErrorTypes.BAD_USER_INPUT);
      const res = await getBackLinkeds(ID);
      return res;
    },
  },
  Mutation: {
    async createJournal(_, { journalInput }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const res = await createSingleJournal(journalInput, userId);
      journalMutation(userId, redisClient, io);
      return res;
    },
    async deleteJournal(_, { ID }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const res = await deleteSingleJournal(ID, userId);
      journalMutation(userId, redisClient, io);
      return res;
    },
    async deleteJournals(_, { Ids }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const resArray = [];
      for (const journalId of Ids) {
        const res = await deleteSingleJournal(journalId, userId);
        resArray.push(res);
      }
      journalMutation(userId, redisClient, io);
      return resArray; // [true, true, false]
    },
    async updateJournal(_, { ID, journalInput }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const res = await updateSingleJournal(ID, journalInput, userId);
      journalMutation(userId, redisClient, io);
      return res;
    },
  },
};

export default journalCacheResolver;
