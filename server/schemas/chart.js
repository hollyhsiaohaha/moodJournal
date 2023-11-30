import { gql } from 'apollo-server-express';

const chartTypeDef = gql`
  type LineChartData {
    labels: [String]
    data: [Int]
  }
  type PieChartData {
    labels: [String]
    data: [Int]
  }
  # Queries
  type Query {
    "Requires authentication"
    getMoodScoreLineChart(period: String!, selectedDate: String!): LineChartData
    "Requires authentication"
    getFeelingPieChart(period: String!, selectedDate: String!): PieChartData
  }
`;

export default chartTypeDef;
