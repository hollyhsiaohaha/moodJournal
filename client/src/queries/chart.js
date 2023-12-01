import { gql } from '@apollo/client';

export const GET_MOOD_SCORE_LINE_CHART = gql`
query GetMoodScoreLineChart($period: String!, $selectedDate: String!) {
  getMoodScoreLineChart(period: $period, selectedDate: $selectedDate) {
    labels
    data
  }
}
`;

export const GET_FEELING_PIE_CHART = gql`
query GetFeelingPieChart($period: String!, $selectedDate: String!) {
  getFeelingPieChart(period: $period, selectedDate: $selectedDate) {
    labels
    data
  }
}
`;

export const GET_FACTOR_SCATTER_CHART = gql`
query GetFactorScatterChart($period: String!, $selectedDate: String!) {
  getFactorScatterChart(period: $period, selectedDate: $selectedDate) {
    label
    data {
      x
      y
    }
  }
}
`;
