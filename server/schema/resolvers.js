import { logger } from '../utils/logger.js';
import { Journal } from '../models/Journal.js';
import { User } from '../models/User.js';

export const resolvers = {
  Query: {
    async getUserbyId(_, { ID }) {
      return await User.findById(ID);
    },
    async getUserbyEmail(_, { email }) {
      // const res = await User.findOne({ email }).exec();
      // console.log(res);
      return await User.findOne({ email }).exec();
    },
  },
  Mutation: {
    async creatUser(_, { userInput: { name, email, password } }) {
      const user = new User({
        name,
        email,
        password,
      });
      const res = await user.save();
      logger.info('User created:');
      logger.info(res);
      return { ...res._doc };
    },
  },
};
