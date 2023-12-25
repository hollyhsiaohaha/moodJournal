import { expect, it, describe, vi } from 'vitest';
import { journalCacheResolver } from '../resolvers/journal.js';

vi.mock('../models/Journal.js');

describe('getJournalbyId', () => {
  it('Returns a journal for a valid ID', async () => {
    const mockJournal = {
      _id: '1',
      userId: '123',
      title: 'Test Journal',
    };
    const arg = { ID: '1' };
    const context = { user: { _id: '123' } };
    const result = await journalCacheResolver.Query.getJournalbyId(null, arg, context);
    expect(result).toEqual(mockJournal);
  });

  it('Throws an error if the journal does not exist', async () => {
    const arg = { ID: '2' };
    const context = { user: { _id: '123' } };
    await expect(journalCacheResolver.Query.getJournalbyId(null, arg, context)).rejects.toThrow(
      'Journal not exist',
    );
  });

  it('Throws an error if the journal belongs to a different user', async () => {
    const arg = { ID: '3' };
    const context = { user: { _id: '123' } };
    await expect(journalCacheResolver.Query.getJournalbyId(null, arg, context)).rejects.toThrow(
      'Journal not exist',
    );
  });
});
