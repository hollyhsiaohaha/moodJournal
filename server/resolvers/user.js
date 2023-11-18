import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';

dotenv.config();

const saltRounds = 10;
const { JWT_SECRET } = process.env;

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
    async signUp(_, { signUpInput: { name, email, password } }) {
      try {
        const existUser = await User.findOne({ email }).exec();
        if (existUser) throwCustomError('email', ErrorTypes.DUPLICATE_KEY);
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({
          name,
          email,
          password: encryptedPassword,
        });
        const res = await user.save();
        logger.info(`User created: ${res._id}`);
        const userInfo = {
          _id: res._id,
          name,
          email,
        };
        const jwtToken = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '1h' });
        return {
          ...userInfo,
          jwtToken,
        };
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    async signIn(_, { signInInput: { email, password } }) {
      try {
        const existUser = await User.findOne({ email }).exec();
        if (!existUser) throwCustomError('incorrect email or password', ErrorTypes.UNAUTHENTICATED);
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const isCorrectPassword = bcrypt.compare(existUser.password, encryptedPassword);
        if (!isCorrectPassword)
          throwCustomError('incorrect email or password', ErrorTypes.UNAUTHENTICATED);
        const userInfo = {
          _id: existUser._id,
          name: existUser.name,
          email,
        };
        // TODO: 記得改回來
        const jwtToken = jwt.sign(userInfo, JWT_SECRET, { expiresIn: '12h' });
        return {
          ...userInfo,
          jwtToken,
        };
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
  },
};
export default userResolver;
