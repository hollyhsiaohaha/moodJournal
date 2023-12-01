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
  type Point {
    x: Float
    y: Float
  }
  type ScatterChartData {
    label: String!
    data: [Point]!
  }
  # Queries
  type Query {
    "Requires authentication"
    getMoodScoreLineChart(period: String!, selectedDate: String!): LineChartData
    "Requires authentication"
    getFeelingPieChart(period: String!, selectedDate: String!): PieChartData
    "Requires authentication"
    getFactorScatterChart(period: String!, selectedDate: String!): [ScatterChartData]
  }
`;

export default chartTypeDef;
