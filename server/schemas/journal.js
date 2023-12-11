import { gql } from 'apollo-server-express';

const journalTypeDef = gql`
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
    title: String
    type: JournalType
    content: String
    diaryDate: String
    moodScore: Int
    moodFeelings: [String]
    moodFactors: [String]
  }
  # Queries
  type Query {
    "Requires authentication"
    getJournalbyId(ID: ID!): Journal!
    "Requires authentication"
    getJournalsbyUserId: [Journal]!
    "Requires authentication"
    getJournalbyTitle(title: String!): Journal!
    "Requires authentication"
    getUserLatestJournals(amount: Int!, type: JournalType!): [Journal]!
    "Requires authentication"
    getDiariesbyMonth(month: String!): [Journal]!
    "Requires authentication"
    searchJournals(keyword: String!): [Journal]!
    "Requires authentication"
    autoCompleteJournals(keyword: String!): [Journal]!
    "Requires authentication"
    getBackLinkedJournals(ID: ID!): [Journal]!
  }

  # Mutations
  type Mutation {
    "Requires authentication"
    createJournal(journalInput: JournalInput!): Journal!
    "Requires authentication"
    deleteJournal(ID: ID!): Boolean
    "Requires authentication"
    deleteJournals(Ids: [ID]!): [Boolean]
    "Requires authentication"
    updateJournal(ID: ID!, journalInput: JournalInput!): Journal!
  }
`;

export default journalTypeDef;
