export const testUsers = [
  // == tester 1 - 5 ==
  // '657174b1f19695d6e72c3c75',
  // '6566d280768cb89b820f2a17',
  // '6566d342768cb89b820f2a1c',
  // '6566d386768cb89b820f2a1f',
  // '6566d3ff768cb89b820f2a22',
  // == tester 6 - 10 ==
  // '657174d8f19695d6e72c3c7b',
  // '657174eff19695d6e72c3c90',
  // '65717503f19695d6e72c3c96',
  // '65717513f19695d6e72c3c9c',
  // '65717528f19695d6e72c3ca2',
];

export const GET_JOURNALS_BY_USER = `
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

export const GET_JOURNALS_LINKED_TYPE = `
  query GetJournalsbyUserId {
    getJournalsbyUserId {
      _id
      title
      type
      linkedNotes {
        _id
        type
      }
    }
  }
`;

export const GET_JOURNAL_ID_BY_TITLE = `
query GetJournalbyTitle($title: String!) {
  getJournalbyTitle(title: $title) {
    _id
  }
}
`;

export const GET_BACKLINK = `
query GetBackLinkedJournals($id: ID!) {
  getBackLinkedJournals(ID: $id) {
    _id
    title
    content
    type
  }
}
`;

export const GET_AUTOCOMPLETE = `
query AutoCompleteJournals($keyword: String!) {
  autoCompleteJournals(keyword: $keyword) {
    title
  }
}
`;

export const SEARCH_JOURNALS = `
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
