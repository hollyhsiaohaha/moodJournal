import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

// === resolvers ===
const graphResolver = {
  Query: {
    async getForceGraph(_, { types }, context) {
      const userId = context.user._id;
      const journals = await Journal.find({ userId, type: { $in: types } });
      const nodes = [];
      const links = [];
      journals.forEach((journal) => {
        const journalId = journal._id.toString();
        const node = { id: journalId, group: journal.type, label: journal.title };
        nodes.push(node);
        journal.linkedNoteIds.forEach((linkedId) => {
          const link = { source: journalId, target: linkedId.toString(), value: 1 };
          links.push(link);
        });
      });
      const GraphData = { nodes, links };
      return GraphData;
    },
  },
};

export default graphResolver;
