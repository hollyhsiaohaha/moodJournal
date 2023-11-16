import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

const userResolver = {
  Query: {
    async getUserbyId(_, { ID }) {
      const res = await User.findById(ID);
      if (!res) throwCustomError('Id not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
    },
    async getUserbyEmail(_, { email }) {
      const res = await User.findOne({ email }).exec();
      if (!res) throwCustomError('Email not exist', ErrorTypes.BAD_USER_INPUT);
      return res;
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

export default userResolver;
