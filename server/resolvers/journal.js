import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import {
  checkIndexExist,
  insertElasticSearch,
  deleteIndex,
  autoCompleteElasticSearch,
} from '../utils/elasticsearch.js';
import mongoose from 'mongoose';

// === helper functions ===
const { REDIS_ENABLED, REDIS_EXPIRED, ELASTIC_SEARCH_ENABLED } = process.env;
const getLinkedNoteIds = async (content, userId) => {
  const linkedNoteIds = [];
  const uniqLinkedNoteIds = {}; // to make sure linkedNoteIds with unique values
  const keywordRegex = /\[\[(.*?)\]\]/g;
  const matches = content.match(keywordRegex);
  if (!matches) return linkedNoteIds;
  const extracted = matches.map((match) => match.slice(2, -2));
  const linkedNoteSearch = extracted.map((keyword) => {
    return Journal.findOne({ userId, title: keyword }).select({ _id: 1 }).exec();
  });
  const linkedNotes = await Promise.all(linkedNoteSearch);
  for (let i = 0; i < linkedNotes.length; i++) {
    if (!linkedNotes[i])
      throwCustomError(`Keyword not exist: ${extracted[i]}`, ErrorTypes.BAD_USER_INPUT);
    const journalId = linkedNotes[i]._id;
    if (!uniqLinkedNoteIds[journalId]) {
      linkedNoteIds.push(journalId);
      uniqLinkedNoteIds[journalId] = 1;
    }
  }
  return linkedNoteIds;
};

export const getBackLinkeds = async (journalId) => {
  const res = await Journal.aggregate([
    {
      $match: {
        linkedNoteIds: { $in: [new mongoose.Types.ObjectId(journalId)] },
      },
    },
  ]);
  return res; // [Journal]
};

const removeDeletedJournal = (linkedNoteIds, deletedId) => {
  const updatedLinkedNoteIds = linkedNoteIds.filter((id) => id.toString() !== deletedId);
  return updatedLinkedNoteIds;
};

const reviseContentForDeleted = (content, deletedTitle) => {
  const updatedContent = content.replace(`[[${deletedTitle}]]`, deletedTitle);
  return updatedContent;
};

const reviseContentForUpdated = (content, originTitle, updatedTitle) => {
  const updatedContent = content.replace(`[[${originTitle}]]`, `[[${updatedTitle}]]`);
  return updatedContent;
};

const deleteSingleJournal = async (journalId, userId) => {
  const targetJournal = await Journal.findById(journalId);
  if (!targetJournal || targetJournal.userId.toString() !== userId) return false;
  // throwCustomError('Target journal not exist', ErrorTypes.BAD_USER_INPUT);
  const backLinkedJornals = await getBackLinkeds(journalId);

  const session = await Journal.startSession();
  session.startTransaction();
  try {
    // delete target journal
    await Journal.findByIdAndDelete({ _id: journalId }, { session });
    // update back linked journals
    for (const journal of backLinkedJornals) {
      await Journal.findByIdAndUpdate(
        { _id: journal._id },
        {
          linkedNoteIds: removeDeletedJournal(journal.linkedNoteIds, journalId),
          content: reviseContentForDeleted(journal.content, targetJournal.title),
        },
        { session },
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    logger.error(error.stack);
    return false;
    // throwCustomError('Error occur when journal deleting', ErrorTypes.INTERNAL_SERVER_ERROR);
  }
};

const autoCompleteMongoAtlas = async (userId, keyword) => {
  const res = await Journal.aggregate([
    {
      $search: {
        index: 'title_autocomplete',
        autocomplete: {
          path: 'title',
          query: keyword,
        },
      },
    },
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
  ]);
  return res;
};

const cacheInvalid = async (key, client) => {
  Number(REDIS_ENABLED) && client?.status === 'ready' ? await client.del(key) : null;
};

const elasticSearchInvalid = async (userId) => {
  Number(ELASTIC_SEARCH_ENABLED) ? await deleteIndex(userId) : null;
};

// === resolvers ===
const journalCacheResolver = {
  Journal: {
    user: async (parent, args, context) => {
      const { loaders } = context;
      const { journalUserLoader } = loaders;
      const user = await journalUserLoader.load(parent.userId);
      return user;
    },
    linkedNotes: async (parent, args, context) => {
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
    async getJournalsbyUserId(_, args, context, info) {
      const userId = context.user._id;
      const { redisClient } = context;
      // info.cacheControl.setCacheHint({ maxAge: 30 });
      let res;
      if (Number(REDIS_ENABLED) && redisClient?.status === 'ready') {
        const cacheRes = await redisClient.get(userId);
        if (cacheRes) {
          console.log('data from cache');
          res = JSON.parse(cacheRes).map((journal) => {
            return {
              _id: new mongoose.Types.ObjectId(journal._id),
              title: journal.title,
              type: journal.type,
              content: journal.content,
              userId: new mongoose.Types.ObjectId(journal.userId),
              linkedNoteIds: journal.linkedNoteIds.map((id) => new mongoose.Types.ObjectId(id)),
              moodFeelings: journal.moodFeelings,
              moodFactors: journal.moodFactors,
              createdAt: new Date(journal.createdAt),
              updatedAt: new Date(journal.updatedAt),
            };
          });
          return res;
        }
        res = await Journal.find({ userId });
        await redisClient.set(userId, JSON.stringify(res), 'EX', REDIS_EXPIRED);
        console.log('data from db');
        return res;
      }
      res = await Journal.find({ userId });
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
      const res = await Journal.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: keyword,
              path: { wildcard: '*' },
            },
          },
        },
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
      ]);
      return res;
    },
    async autoCompleteJournals(_, { keyword }, context) {
      const userId = context.user._id;
      if (Number(ELASTIC_SEARCH_ENABLED)) {
        const isIndexExist = await checkIndexExist(userId);
        if (isIndexExist) {
          const elasticRes = await autoCompleteElasticSearch(userId, keyword);
          console.log('autocomplete from elastic search');
          return elasticRes;
        } else {
          const journals = await Journal.find({ userId });
          await insertElasticSearch(userId, journals);
          console.log('autocomplete input elastic search');
        }
      }
      console.log('autocomplete from DB');
      const res = await autoCompleteMongoAtlas(userId, keyword);
      return res;
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
        await elasticSearchInvalid(userId);
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
      await elasticSearchInvalid(userId);
      io.emit('message', 'journal update');
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
      await cacheInvalid(userId, redisClient);
      await elasticSearchInvalid(userId);
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
      if (journalInput.content || '' != targetJournal.content) {
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
        await elasticSearchInvalid(userId);
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
