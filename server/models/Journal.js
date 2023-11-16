import mongoose from 'mongoose';

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

export const Journal = mongoose.model('Journal', JournalSchema);
