import fs from 'fs';

const noteData = fs.readFileSync('./mock/notes.json', 'utf8');
const diaryData = fs.readFileSync('./mock/diary.json', 'utf8');
const notes = JSON.parse(noteData);
const diaries = JSON.parse(diaryData);
const url = 'http://localhost:3000/graphql';

const inserJournal = async (journal) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      mutation Mutation($journalInput: JournalInput!) {
        createJournal(journalInput: $journalInput) {
          _id
        }
      }
        `,
      variables: journal,
    }),
  });
  const result = await res.json();
  return result;
};

console.log('=== insert diaries ===');
diaries.forEach(async (diary) => {
  const result = await inserJournal(diary);
  console.log(result);
});
