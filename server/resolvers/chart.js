import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import mongoose from 'mongoose';
import { Feelings, feelingOptions } from '../models/Emotion.js';

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
  } else if (period === 'Year') {
    firstDay = new Date(y, 0, 1);
    lastDay = new Date(y + 1, 0, 1);
  } else {
    firstDay = '1970-01-01';
    lastDay = date;
  }
  return { firstDay, lastDay };
};

const getPeriodJournals = async (userId, period, selectedDate) => {
  const { firstDay, lastDay } = calculateDatePeriod(selectedDate, period);
  const res = await Journal.find({
    userId,
    diaryDate: { $gte: firstDay, $lte: lastDay },
  }).sort({ diaryDate: 1 });
  return res;
};

// === resolvers ===
const chartResolver = {
  Query: {
    async getMoodScoreLineChart(_, { period, selectedDate }, context) {
      const journals = await getPeriodJournals(context.user._id, period, selectedDate);
      const labels = journals.map((journal) => journal.title);
      const data = journals.map((journal) => journal.moodScore);
      const chartData = { labels, data };
      return chartData;
    },
    async getFeelingPieChart(_, { period, selectedDate }, context) {
      const journals = await getPeriodJournals(context.user._id, period, selectedDate);
      const feelingsCount = {};
      journals.forEach((journal) => {
        journal.moodFeelings.forEach((mood) => {
          feelingsCount[mood] ? (feelingsCount[mood] += 1) : (feelingsCount[mood] = 1);
        });
      });
      const sortFeelingsCount = {};
      feelingOptions.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(feelingsCount, key)) {
          sortFeelingsCount[key] = feelingsCount[key];
        }
      });
      const labels = [];
      const data = [];
      for (const [key, value] of Object.entries(sortFeelingsCount)) {
        labels.push(key);
        data.push(value);
      }
      const chartData = { labels, data };
      return chartData;
    },
    async getFactorScatterChart(_, { period, selectedDate }, context) {
      const journals = await getPeriodJournals(context.user._id, period, selectedDate);
      const factorScores = {};
      journals.forEach((journal) => {
        journal.moodFactors.forEach((factor) => {
          factorScores[factor] ? null : (factorScores[factor] = []);
          factorScores[factor].push(journal.moodScore);
        });
      });
      const chartData = [];
      for (const [key, value] of Object.entries(factorScores)) {
        const count = value.length;
        const scoreSum = value.reduce((partialSum, a) => partialSum + a, 0);
        const scoreAverage = (scoreSum / count).toFixed(2);
        chartData.push({ label: key, data: [{ x: scoreAverage, y: count }] });
      }
      return chartData;
    },
    async getKeywordBarChart(_, { period, selectedDate, keyword }, context) {
      const res = await Journal.findOne({ userId: context.user._id, title: keyword }).exec();
      const keywordJournalId = res?._id;
      const journals = (await getPeriodJournals(context.user._id, period, selectedDate)) || [];
      const mentionedKeywordJournals = journals.filter((journal) =>
        journal.linkedNoteIds.includes(keywordJournalId),
      );
      const feelingsCount = {};
      mentionedKeywordJournals.forEach((journal) => {
        journal.moodFeelings.forEach((mood) => {
          feelingsCount[mood] ? (feelingsCount[mood] += 1) : (feelingsCount[mood] = 1);
        });
      });
      const labels = Feelings.map((category) => category.name);
      const datasets = [];
      for (let i = 0; i < Feelings.length; i++) {
        const category = Feelings[i];
        category.values.forEach((feeling) => {
          if (feelingsCount[feeling]) {
            const data = new Array(labels.length).fill(0);
            data[i] = feelingsCount[feeling];
            const dataset = { label: feeling, data };
            datasets.push(dataset);
          }
        });
      }
      const data = { labels, datasets };
      return data;
    },
  },
};

export default chartResolver;
