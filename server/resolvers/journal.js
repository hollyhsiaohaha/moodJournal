import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

// === helper functions ===
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

const getBackLinkeds = async (journalId) => {
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

// === resolvers ===
const journalResolver = {
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
    async getJournalsbyUserId(_, args, context) {
      const userId = context.user._id;
      const res = await Journal.find({ userId });
      return res;
    },
    async getUserLatestJournals(_, { amount, type }, context) {
      const userId = context.user._id;
      const res = await Journal.find({ userId, type }).sort({ updatedAt: -1 }).limit(amount);
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
              path: {
                wildcard: '*',
              },
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
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
      ]);
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
      const targetJournal = await Journal.findById(ID);
      if (!targetJournal || targetJournal.userId.toString() !== userId)
        throwCustomError('Target journal not exist', ErrorTypes.BAD_USER_INPUT);
      const backLinkedJornals = await getBackLinkeds(ID);

      const session = await Journal.startSession();
      session.startTransaction();
      try {
        // delete target journal
        await Journal.findByIdAndDelete({ _id: ID }, { session });
        // update back linked journals
        for (const journal of backLinkedJornals) {
          await Journal.findByIdAndUpdate(
            { _id: journal._id },
            {
              linkedNoteIds: removeDeletedJournal(journal.linkedNoteIds, ID),
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
        throwCustomError('Error occur when journal deleting', ErrorTypes.INTERNAL_SERVER_ERROR);
      }
    },
    async updateJournal(_, { ID, journalInput }, context) {
      const userId = context.user._id;
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
        return updatedJournal;
      } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        logger.error(error.stack);
        throwCustomError('Error occur when journal updating', ErrorTypes.INTERNAL_SERVER_ERROR);
      }
    },
  },
};

export default journalResolver;
