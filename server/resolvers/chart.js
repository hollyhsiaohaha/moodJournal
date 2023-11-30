import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

// === helper functions ===
const calculateDatePeriod = (targetDate, period) => {
  const date = new Date(targetDate);
  const y = date.getFullYear();
  const m = date.getMonth();
  let firstDay;
  let lastDay;
  if (period === 'Month') {
    firstDay = new Date(y, m, 1);
    lastDay = new Date(y, m + 1, 2);
  } else {
    firstDay = new Date(y, 0, 1);
    lastDay = new Date(y + 1, 0, 1);
  }
  return { firstDay, lastDay };
};

// === resolvers ===
const chartResolver = {
  Query: {
    async getMoodScoreLineChart(_, { period, selectedDate }, context) {
      const userId = context.user._id;
      console.log(selectedDate);
      const { firstDay, lastDay } = calculateDatePeriod(selectedDate, period);
      console.log(firstDay);
      console.log(lastDay);
      const res = await Journal.find({
        userId,
        diaryDate: { $gte: firstDay, $lte: lastDay },
      }).sort({ diaryDate: 1 });
      const labels = res.map((journal) => journal.title);
      const data = res.map((journal) => journal.moodScore);
      const chartData = { labels, data };
      return chartData;
    },
  },
};

export default chartResolver;
