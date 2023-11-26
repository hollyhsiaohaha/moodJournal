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
