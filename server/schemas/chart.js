import { gql } from 'apollo-server-express';

const chartTypeDef = gql`
  type LineChartData {
    labels: [String]
    data: [Int]
  }
  # Queries
  type Query {
    "Requires authentication"
    getMoodScoreLineChart(period: String!, selectedDate: String!): LineChartData
  }
`;

export default chartTypeDef;
