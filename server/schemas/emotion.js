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
  # Queries
  type Query {
    getFeelings: [Feeling!]!
    getFactors: [Factor!]!
  }
`;

export default emotionTypeDef;
