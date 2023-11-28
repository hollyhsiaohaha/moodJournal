import { gql } from '@apollo/client';

export const GET_FEELINGS = gql`
query GetFeelings {
  getFeelings {
    name
    values
  }
}
`;

export const GET_FACTORS = gql`
query getFactors {
  getFactors {
    name
    values
  }
}
`;

export const SENTIMENT_ANALYSIS = gql`
query SentimentAnalysisOpenAi($journalContent: String!) {
  sentimentAnalysisOpenAi(journalContent: $journalContent) {
    score
    feeling
    factor
  }
}
`;
