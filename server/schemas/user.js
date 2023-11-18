import { gql } from 'apollo-server-express';

const userTypeDef = gql`
  # Types
  type User {
    _id: String
    name: String
    email: String
  }
  type UserJWT {
    _id: String
    name: String
    email: String
    jwtToken: String
  }
  input SignUpInput {
    name: String
    email: String
    password: String
  }
  input SignInInput {
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
    signUp(signUpInput: SignUpInput!): UserJWT
    signIn(signInInput: SignInInput!): UserJWT
  }
`;

export default userTypeDef;
