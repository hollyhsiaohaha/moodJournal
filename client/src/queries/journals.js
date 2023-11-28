import { gql } from '@apollo/client';

export const GET_AUTOCOMPLETE = gql`
query AutoCompleteJournals($keyword: String!) {
  autoCompleteJournals(keyword: $keyword) {
    title
  }
}
`;

export const GET_JOURNAL_ID_BY_TITLE = gql`
query GetJournalbyTitle($title: String!) {
  getJournalbyTitle(title: $title) {
    _id
  }
}
`;

export const GET_VOICE_TO_TEXT = gql`
query Query($fileName: String!) {
  voiceToText(fileName: $fileName)
}
`;

export const GET_JOURNAL_BY_ID = gql`
query GetJournalbyId($id: ID!) {
  getJournalbyId(ID: $id) {
    _id
    title
    type
    content
    userId
    createdAt
    updatedAt
    diaryDate
    moodScore
    moodFeelings
    moodFactors
    linkedNoteIds
  }
}
`;

export const GET_BACKLINK = gql`
query GetBackLinkedJournals($id: ID!) {
  getBackLinkedJournals(ID: $id) {
    _id
    title
    content
    type
  }
}
`;

export const Get_JOURNALS_BY_USER = gql`
query GetJournalsbyUserId {
  getJournalsbyUserId {
    _id
    title
    type
    content
    userId
    moodScore
    moodFeelings
    moodFactors
    createdAt
    updatedAt
  }
}
`;