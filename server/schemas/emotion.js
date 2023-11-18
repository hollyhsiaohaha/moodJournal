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
    sentimentAnalysis(journalContent: String!): SentimentAnalysis!
  }
`;

export default emotionTypeDef;
