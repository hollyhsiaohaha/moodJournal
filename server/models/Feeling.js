import mongoose from 'mongoose';

const FeelingSchema = new mongoose.Schema({
  title: {
    type: String,
    index: true,
    unique: true,
  },
  category: String,
});

export const Feeling = mongoose.model('Feeling', FeelingSchema);
