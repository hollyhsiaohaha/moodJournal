import { gql } from 'apollo-server-express';

const userTypeDef = gql`
  # Types
  type User {
    _id: String
    name: String
    email: String
    password: String
    createdAt: String
  }
  input UserInput {
    name: String
    email: String
    password: String
  }
  # Queries
  type Query {
    getUserbyId(ID: ID!): User!
    getUserbyEmail(email: String!): User!
  }

  # Mutations
  type Mutation {
    creatUser(userInput: UserInput!): User!
  }
`;

export default userTypeDef;
