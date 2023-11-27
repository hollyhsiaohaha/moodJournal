import { gql } from '@apollo/client';

export const CREATE_JOURNAL = gql`
mutation Mutation($journalInput: JournalInput!) {
  createJournal(journalInput: $journalInput) {
    _id
    title
    type
    content
    userId
    linkedNoteIds
    createdAt
    updatedAt
  }
}
`;

export const UPDATE_JOURNAL = gql`
mutation UpdateJournal($id: ID!, $journalInput: JournalInput!) {
  updateJournal(ID: $id, journalInput: $journalInput) {
    _id
    title
    type
    content
  }
}
`;

export const DELETE_JOURNAL = gql`
mutation DeleteJournal($id: ID!) {
  deleteJournal(ID: $id)
}
`;
