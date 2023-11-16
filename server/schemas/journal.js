import { gql } from 'apollo-server-express';

const userTypeDef = gql`
  # Types
  enum JournalType {
    diary
    note
  }
  type Journal {
    _id: String
    title: String
    type: JournalType
    content: String
    userId: String
    user: User
    linkedNoteIds: [String]
    linkedNotes: [Journal]
    createdAt: String
    updatedAt: String
    diaryDate: String
    moodScore: Int
    moodFeelings: [String]
    moodFactors: [String]
  }
  input JournalInput {
    title: String!
    type: JournalType!
    content: String!
    userId: String!
    linkedNoteIds: [String]
    diaryDate: String
    moodScore: Int
    moodFeelings: [String]
    moodFactors: [String]
  }
  # Queries
  type Query {
    getJournalbyId(ID: ID!): Journal!
    getJournalbyTitle(userId: String!, title: String!): Journal!
    getLatestNotes(userId: String!, amount: Int!): [Journal]!
    getLatestDiaries(userId: String!, amount: Int!): [Journal]!
  }

  # Mutations
  type Mutation {
    creatJournal(journalInput: JournalInput!): Journal!
  }
`;

export default userTypeDef;
