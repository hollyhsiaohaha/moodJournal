import mongoose from 'mongoose';

const FactorSchema = new mongoose.Schema({
  title: {
    type: String,
    index: true,
    unique: true,
  },
  category: String,
});

export const Factor = mongoose.model('Factor', FactorSchema);
