import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import {
  insertElasticSearch,
  deleteIndex,
  autoCompleteElasticSearch,
} from '../utils/elasticSearch.js';
import {
  Journal,
  getLinkedNoteIds,
  getBackLinkeds,
  autoCompleteMongoAtlas,
  deleteSingleJournal,
  fullTextSearchJournals,
} from '../models/Journal.js';

const REDIS_ENABLED = Number(process.env.REDIS_ENABLED);
const REDIS_EXPIRED = Number(process.env.REDIS_EXPIRED);
const ELASTIC_SEARCH_ENABLED = Number(process.env.ELASTIC_SEARCH_ENABLED);

// === helper functions ===
export const reviseContentForUpdated = (content, originTitle, updatedTitle) => {
  const updatedContent = content.replace(`[[${originTitle}]]`, `[[${updatedTitle}]]`);
  return updatedContent;
};

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
  // TODO: ++ try catch
  Mutation: {
    async createJournal(
      _,
      { journalInput: { title, type, content, diaryDate, moodScore, moodFeelings, moodFactors } },
      context,
    ) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const linkedNoteIds = await getLinkedNoteIds(content, userId);
      const journal = new Journal({
        title,
        type,
        content,
        userId,
        diaryDate,
        moodScore,
        moodFeelings,
        moodFactors,
        linkedNoteIds,
      });
      try {
        const res = await journal.save();
        logger.info('Journal created:');
        logger.info(res);
        await cacheInvalid(userId, redisClient);
        await elasticSearchReload(userId);
        io.emit('message', 'journal update');
        return { ...res._doc };
      } catch (error) {
        if (error.message.includes('duplicate key error')) {
          throwCustomError(`DUPLICATE_KEY: ${title}`, ErrorTypes.DUPLICATE_KEY);
        }
        logger.error(error);
        throw error;
      }
    },
    async deleteJournal(_, { ID }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const res = await deleteSingleJournal(ID, userId);
      await cacheInvalid(userId, redisClient);
      await elasticSearchReload(userId);
      io.emit('message', 'journal update');
      return res;
    },
    // TODO: add error handleing
    async deleteJournals(_, { Ids }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const resArray = [];
      for (const journalId of Ids) {
        const res = await deleteSingleJournal(journalId, userId);
        resArray.push(res);
      }
      await cacheInvalid(userId, redisClient);
      await elasticSearchReload(userId);
      io.emit('message', 'journal update');
      return resArray;
    },
    async updateJournal(_, { ID, journalInput }, context) {
      const userId = context.user._id;
      const { io, redisClient } = context;
      const targetJournal = await Journal.findById(ID);
      if (!targetJournal || targetJournal.userId.toString() !== userId)
        throwCustomError('Target journal not exist', ErrorTypes.BAD_USER_INPUT);
      // update target journal and linkedNoteIds if needed
      if (journalInput.content || '' !== targetJournal.content) {
        const updatedLinkedNoteIds = await getLinkedNoteIds(journalInput.content, userId);
        journalInput.linkedNoteIds = updatedLinkedNoteIds;
      }
      const session = await Journal.startSession();
      session.startTransaction();
      try {
        const updatedJournal = await Journal.findByIdAndUpdate(
          { _id: ID },
          { ...journalInput, updatedAt: new Date().toISOString() },
          { new: true, session },
        );
        // update back linked journals
        if (journalInput.title) {
          const backLinkedJornals = await getBackLinkeds(ID);
          for (const journal of backLinkedJornals) {
            await Journal.findByIdAndUpdate(
              { _id: journal._id },
              {
                content: reviseContentForUpdated(
                  journal.content,
                  targetJournal.title,
                  journalInput.title,
                ),
              },
              { session },
            );
          }
        }
        await session.commitTransaction();
        await session.endSession();
        await cacheInvalid(userId, redisClient);
        await elasticSearchReload(userId);
        io.emit('message', 'journal update');
        return updatedJournal;
      } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        logger.error(error.stack);
        if (error.message.includes('title_1_userId_1 dup key'))
          return throwCustomError('DUPLICATE_TITLE', ErrorTypes.BAD_USER_INPUT);
        throwCustomError('Error occur when journal updating', ErrorTypes.INTERNAL_SERVER_ERROR);
      }
    },
  },
};

export default journalCacheResolver;
