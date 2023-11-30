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
