import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

export const ErrorTypes = {
  BAD_USER_INPUT: {
    errorCode: ApolloServerErrorCode.BAD_USER_INPUT,
    errorStatus: 400,
  },
  BAD_REQUEST: {
    errorCode: ApolloServerErrorCode.BAD_REQUEST,
    errorStatus: 400,
  },
  DUPLICATE_KEY: {
    errorCode: 'DUPLICATE_KEY',
    errorStatus: 400,
  },
  UNAUTHENTICATED: {
    errorCode: 'UNAUTHENTICATED',
    errorStatus: 403,
  },
  INTERNAL_SERVER_ERROR: {
    errorCode: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    errorStatus: 500,
  },
};

export function throwCustomError(errorMessage, ErrorType) {
  throw new GraphQLError(errorMessage, {
    extensions: {
      code: ErrorType.errorCode,
      http: {
        status: ErrorType.errorStatus,
      },
    },
  });
}
