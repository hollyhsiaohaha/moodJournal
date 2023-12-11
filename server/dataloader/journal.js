import DataLoader from 'dataloader';
import { groupBy, map } from 'ramda';
import { Journal } from '../models/Journal.js';
import { User } from '../models/User.js';

export function journalUserDataloader() {
  return new DataLoader(getJournalUser);
}

export function journalLinkDataloader() {
  return new DataLoader(getLinkJournal);
}

async function getJournalUser(userIds) {
  const users = await User.find({
    _id: { $in: userIds },
  });
  const groupedByUser = groupBy((user) => user._id, users);
  const res = map((userId) => groupedByUser[userId][0], userIds);
  return res;
}

async function getLinkJournal(journalIds) {
  const journals = await Journal.find({
    _id: { $in: journalIds },
  });
  console.log('fetching DB in dataloader');
  const journalMap = new Map(journals.map((journal) => [journal.id.toString(), journal]));
  const res = journalIds.map((id) => journalMap.get(id.toString()));
  return res;
}
