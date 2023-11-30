import { gql } from '@apollo/client';

export const GET_MOOD_SCORE_LINE_CHART = gql`
query GetMoodScoreLineChart($period: String!, $selectedDate: String!) {
  getMoodScoreLineChart(period: $period, selectedDate: $selectedDate) {
    labels
    data
  }
}
`;
