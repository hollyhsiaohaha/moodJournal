import { gql } from '@apollo/client';

export const GET_AUTOCOMPLETE = gql`
query AutoCompleteJournals($keyword: String!) {
  autoCompleteJournals(keyword: $keyword) {
    title
  }
}
`;
