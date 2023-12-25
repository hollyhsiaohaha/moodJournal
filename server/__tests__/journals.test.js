import { expect, it, describe } from 'vitest';
import {
  removeDeletedJournal,
  reviseContentForDeleted,
  reviseContentForUpdated,
} from '../models/Journal.js';

describe('Remove deleted journal from linked id array', () => {
  const deletedId = '2';
  it('Array include deleted id', () => {
    expect(removeDeletedJournal(['1', '2', '3'], deletedId)).toEqual(
      expect.not.arrayContaining([deletedId]),
    );
  });
  it('Array not include deleted id', () => {
    expect(removeDeletedJournal(['1', '3'], deletedId)).toEqual(expect.arrayContaining(['1', '3']));
  });
});

describe('Revise linked journal content for deleted journal', () => {
  it('Content with keyword', () => {
    expect(reviseContentForDeleted('This is content with [[keyword]]!', 'keyword')).toBe(
      'This is content with keyword!',
    );
  });
  it('Content without keyword', () => {
    expect(reviseContentForDeleted('This is content with NOTkeyword!', 'keyword')).toBe(
      'This is content with NOTkeyword!',
    );
  });
  it('Empty content', () => {
    expect(reviseContentForDeleted('', 'keyword')).toBe('');
  });
});

describe('Revise linked journal content for updated journal', () => {
  it('Content with keyword', () => {
    expect(
      reviseContentForUpdated('This is content with [[keyword]]!', 'keyword', 'new keyword'),
    ).toBe('This is content with [[new keyword]]!');
  });
  it('Content without keyword', () => {
    expect(
      reviseContentForUpdated('This is content with [[NOTkeyword]]!', 'keyword', 'new keyword'),
    ).toBe('This is content with [[NOTkeyword]]!');
  });
  it('Empty content', () => {
    expect(reviseContentForUpdated('', 'keyword', 'new keyword')).toBe('');
  });
});
