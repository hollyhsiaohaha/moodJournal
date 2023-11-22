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
