import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  GET_JOURNALS_BY_USER,
  GET_JOURNALS_LINKED_TYPE,
  GET_AUTOCOMPLETE,
  GET_JOURNAL_ID_BY_TITLE,
  GET_BACKLINK,
  SEARCH_JOURNALS,
} from './testConf.js';

const url = 'https://mood-journal.holly-hsiao.com/graphql';
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTcxNzRiMWYxOTY5NWQ2ZTcyYzNjNzUiLCJuYW1lIjoidGVzdDEiLCJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwiaWF0IjoxNzAyNzc4NjQyLCJleHAiOjE3MDI4NjUwNDJ9.10sNyzjHOW-wqxamf49Fe8oZac-aDJiqv9vVUzr86Bs';

// === GET_JOURNALS_BY_USER ===
// const query = GET_JOURNALS_BY_USER;
// const payload = { query, operationName: 'GetJournalsbyUserId' };

// === GET_JOURNALS_LINKED_TYPE ===
// const query = GET_JOURNALS_LINKED_TYPE;
// const payload = { query, operationName: 'GetJournalsbyUserId' };

// === GET_AUTOCOMPLETE ===
const query = GET_AUTOCOMPLETE;
const variables = { keyword: '第一百筆' };
const payload = { query, variables, operationName: 'AutoCompleteJournals' };

// === GET_JOURNAL_ID_BY_TITLE ===
// const query = GET_JOURNAL_ID_BY_TITLE;
// const variables = { title: '子華' };
// const payload = { query, variables, operationName: 'GetJournalbyTitle' };

// === GET_BACKLINK ===
// const query = GET_BACKLINK;
// const variables = { id: '65570b7a77238dc23a63ac77' };
// const payload = { query, variables, operationName: 'GetBackLinkedJournals' };

// === SEARCH_JOURNALS ===
// const query = SEARCH_JOURNALS;
// const variables = { keyword: '奇峻' };
// const payload = { query, variables, operationName: 'SearchJournals' };

const headers = {
  Authorization: token,
  'Content-Type': 'application/json',
};

export const options = {
  // == smoke ===
  vus: 3,
  duration: '3s',
  // == light load ==
  // stages: [
  //   { duration: '5m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
  //   { duration: '5m', target: 100 }, // stay at 100 users for 30 minutes
  //   { duration: '5m', target: 0 }, // ramp-down to 0 users
  // ],
  // == load ==
  // stages: [
  //   { duration: '5m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
  //   { duration: '30m', target: 100 }, // stay at 100 users for 30 minutes
  //   { duration: '5m', target: 0 }, // ramp-down to 0 users
  // ],
  // == stress ==
  // stages: [
  //   { duration: '10m', target: 200 }, // traffic ramp-up from 1 to a higher 200 users over 10 minutes.
  //   { duration: '30m', target: 200 }, // stay at higher 200 users for 30 minutes
  //   { duration: '5m', target: 0 }, // ramp-down to 0 users
  // ],
  // == spike ==
  // stages: [
  //   { duration: '2m', target: 200 }, // fast ramp-up to a high point
  //   // No plateau
  //   { duration: '1m', target: 0 }, // quick ramp-down to 0 users
  // ],
};

export default () => {
  const urlRes = http.post(url, JSON.stringify(payload), { headers });
  let responseBody = JSON.parse(urlRes.body);
  console.log('Response body:', responseBody);
  // console.log('Data:', responseBody.data);
  // console.log('Errors:', responseBody.errors);
  check(urlRes, {
    'status was 200 and without errors': (r) => r.status == 200 && !JSON.parse(r.body).errors,
  });
  sleep(1);
};
