export const journalFindById = async (journalId) => {
  const mockJournal = {
    _id: '1',
    userId: '123',
    title: 'Test Journal',
  };
  const mockJournal2 = {
    _id: '3',
    userId: '456',
    title: 'Test Journal',
  };
  if (journalId === '1') return mockJournal;
  if (journalId === '2') return null;
  if (journalId === '3') return mockJournal2;
  return null;
};
