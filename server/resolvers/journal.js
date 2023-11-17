import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

const getLinkedNoteIds = async (content, userId) => {
  const linkedNoteIds = [];
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
    linkedNoteIds.push(linkedNotes[i]._id);
  }
  return linkedNoteIds;
};

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
    async createJournal(
      _,
      {
        journalInput: {
          title,
          type,
          content,
          userId,
          diaryDate,
          moodScore,
          moodFeelings,
          moodFactors,
        },
      },
    ) {
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
          throwCustomError(`Journal title already exist: ${title}`, ErrorTypes.BAD_USER_INPUT);
        }
        logger.error(error);
        throw error;
      }
    },
  },
};

export default journalResolver;
