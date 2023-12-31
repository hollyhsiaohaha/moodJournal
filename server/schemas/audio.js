import { gql } from 'apollo-server-express';

const audioTypeDef = gql`
  # Types
  type Audio {
    fileName: String
  }
  # Queries
  type Query {
    getAudioSignedUrl(fileName: String!): String!
    voiceToText(fileName: String!): String!
  }

  # Mutations
`;

export default audioTypeDef;
