import { gql } from 'apollo-server-express';

const emotionTypeDef = gql`
  # Types
  type Feeling {
    name: String
    values: [String]
  }
  type Factor {
    name: String
    values: [String]
  }
  type SentimentAnalysis {
    score: Int
    feeling: [String]
    factor: [String]
  }
  # Queries
  type Query {
    getFeelings: [Feeling!]!
    getFactors: [Factor!]!
    "Requires authentication"
    SentimentAnalysisOpenAi(journalContent: String!): SentimentAnalysis!
    "Requires authentication"
    SentimentAnalysis(journalContent: String!): SentimentAnalysis!
  }
`;

export default emotionTypeDef;
