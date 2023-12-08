import jwt from 'jsonwebtoken';
import { journalUserDataloader, journalLinkDataloader } from '../dataloader/journal.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

const { JWT_SECRET } = process.env;

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

const context = async ({ req }) => {
  const loaders = {
    journalUserLoader: journalUserDataloader(),
    journalLinkLoader: journalLinkDataloader(),
  };
  const io = req.app.get('socketio');
  const operationName = req.body.operationName;
  const notRequireAuthOperations = [
    'SignUp',
    'SignIn',
    'IntrospectionQuery',
    'getFeelings',
    'getFactors',
  ];
  logger.info(`GraphQL operation name: ${operationName}`);
  if (notRequireAuthOperations.includes(operationName) || !operationName) {
    return;
  }
  const token = req.headers.authorization || '';
  try {
    const payload = await verifyToken(token);
    return {
      user: payload,
      loaders,
      io,
    };
  } catch (error) {
    logger.error(error);
    throwCustomError(`${error.message}`, ErrorTypes.UNAUTHENTICATED);
  }
};

export default context;
