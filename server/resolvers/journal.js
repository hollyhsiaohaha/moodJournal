import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

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
    async getJournalbyId(_, { ID }) {
      const res = await Journal.findById(ID);
      if (!res) throwCustomError('Id not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
    },
    async getJournalbyTitle(_, { userId, title }) {
      const res = await Journal.findOne({ userId, title }).exec();
      if (!res) throwCustomError('Title not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
    },
    async getUserLatestJournals(_, { userId, amount, type }) {
      const res = await Journal.find({ userId, type }).sort({ updatedAt: -1 }).limit(amount);
      return res;
    },
  },
  Mutation: {
    // async createJournal(
    //   _,
    //   {
    //     JournalInput: {
    //       title,
    //       type,
    //       content,
    //       userId,
    //       linkedNoteIds,
    //       diaryDate,
    //       moodScore,
    //       moodFeelings,
    //       moodFactors,
    //     },
    //   },
    // ) {
    //   const journal = new Journal({
    //     title,
    //     type,
    //     content,
    //     userId,
    //     linkedNoteIds,
    //     diaryDate,
    //     moodScore,
    //     moodFeelings,
    //     moodFactors,
    //   });
    //   try {
    //     const res = await journal.save();
    //     logger.info('Journal created:');
    //     logger.info(res);
    //     return { ...res._doc };
    //   } catch (error) {
    //     logger.error(error);
    //     throw error;
    //   }
    // },
    async createJournal(_, { JournalInput }) {
      console.log(JournalInput);
      const journal = new Journal({
        ...JournalInput,
      });
      try {
        const res = await journal.save();
        logger.info('Journal created:');
        logger.info(res);
        return { ...res._doc };
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
  },
};
// TODO: JournalInput 是空的
// TODO: loader 會壞

export default journalResolver;
