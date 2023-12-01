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
    y: Int
  }
  type ScatterChartData {
    label: String!
    data: [Point]!
  }
  type BarChartDataSet {
    label: String!
    data: [Int]!
  }
  type BarChartData {
    labels: [String]!
    datasets: [BarChartDataSet]!
  }
  # Queries
  type Query {
    "Requires authentication"
    getMoodScoreLineChart(period: String!, selectedDate: String!): LineChartData
    "Requires authentication"
    getFeelingPieChart(period: String!, selectedDate: String!): PieChartData
    "Requires authentication"
    getFactorScatterChart(period: String!, selectedDate: String!): [ScatterChartData]
    "Requires authentication"
    getKeywordBarChart(period: String!, selectedDate: String!, keyword: String!): BarChartData
  }
`;

export default chartTypeDef;
