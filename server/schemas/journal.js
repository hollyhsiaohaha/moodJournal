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
    diaryDate: String
    moodScore: Int
    moodFeelings: [String]
    moodFactors: [String]
  }
  # Queries
  type Query {
    getJournalbyId(ID: ID!): Journal!
    getJournalbyTitle(userId: String!, title: String!): Journal!
    getUserLatestJournals(userId: String!, amount: Int!, type: JournalType!): [Journal]!
    searchJournals(userId: String!, keyword: String!): [Journal]!
    autoCompleteJournals(userId: String!, keyword: String!): [Journal]!
    getBackLinkedJournals(ID: ID!): [Journal]!
  }

  # Mutations
  type Mutation {
    createJournal(journalInput: JournalInput!): Journal!
  }
`;

export default userTypeDef;
