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

export const GET_DIARIES_BY_MONTH = gql`
query GetDiariesbyMonth($month: String!) {
  getDiariesbyMonth(month: $month) {
    _id
    title
    content
    createdAt
    updatedAt
    moodScore
    moodFeelings
    moodFactors
  }
}
`;

export const GET_LATEST_JOURNALS = gql`
query GetUserLatestJournals($amount: Int!, $type: JournalType!) {
  getUserLatestJournals(amount: $amount, type: $type) {
    _id
    title
    type
    content
    userId
    createdAt
    updatedAt
    moodScore
    moodFeelings
    moodFactors
  }
}
`;

export const SEARCH_JOURNALS = gql`
query SearchJournals($keyword: String!) {
  searchJournals(keyword: $keyword) {
    _id
    title
    type
    content
    updatedAt
    moodScore
    moodFeelings
    moodFactors
  }
}
`;

export const GET_JOURNALS_LINKED_TYPE = gql`
query GetJournalsbyUserId {
  getJournalsbyUserId {
    _id
    title
    type
    linkedNotes {
      _id
      title
      type
    }
  }
}
`;

export const GET_JOURNAL_BY_ID_LINKED_TYPE = gql`
query GetJournalbyId($id: ID!) {
  getJournalbyId(ID: $id) {
    _id
    title
    type
    linkedNotes {
      _id
      title
      type
    }
  }
}
`;