import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

const JournalSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['diary', 'note'],
  },
  content: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  linkedNoteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Journal' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  diaryDate: { type: Date },
  moodScore: Number,
  moodFeelings: [String],
  moodFactors: [String],
});

JournalSchema.index({ title: 1, userId: 1 }, { unique: true });

export const Journal = mongoose.model('Journal', JournalSchema);

export const removeDeletedJournal = (linkedNoteIds, deletedId) => {
  const updatedLinkedNoteIds = linkedNoteIds.filter((id) => id.toString() !== deletedId);
  return updatedLinkedNoteIds;
};

export const reviseContentForDeleted = (content, deletedTitle) => {
  const updatedContent = content.replace(`[[${deletedTitle}]]`, deletedTitle);
  return updatedContent;
};

export const getLinkedNoteIds = async (content, userId) => {
  const keywordRegex = /\[\[(.*?)\]\]/g;
  const matchedKeywords = content.match(keywordRegex); // ['[[AppWorks School]]', '[[Apple]]']
  if (!matchedKeywords) return [];
  const extractedKeywords = matchedKeywords.map((match) => match.slice(2, -2));
  const uniqueKeywordsMapping = {};
  extractedKeywords.forEach((keyword) =>
    uniqueKeywordsMapping[keyword] ? null : (uniqueKeywordsMapping[keyword] = 1),
  );
  const uniqueKeywords = Object.keys(uniqueKeywordsMapping);
  const linkedJornals = await Journal.find({ userId, title: uniqueKeywords })
    .select({ _id: 1, title: 1 })
    .exec();
  const journalTitleIdMapping = linkedJornals.reduce(
    (obj, item) => Object.assign(obj, { [item.title]: item._id }),
    {},
  );
  uniqueKeywords.forEach((keyword) => {
    if (!journalTitleIdMapping[keyword])
      throwCustomError(`Keyword not exist: ${keyword}`, ErrorTypes.BAD_USER_INPUT);
  });
  return linkedJornals.map((journal) => journal._id);
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

export const autoCompleteMongoAtlas = async (userId, keyword) => {
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

export const deleteSingleJournal = async (journalId, userId) => {
  const targetJournal = await Journal.findById(journalId);
  if (!targetJournal || targetJournal.userId.toString() !== userId) return false;
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
  }
};

export const fullTextSearchJournals = async (keyword, userId) => {
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
};
