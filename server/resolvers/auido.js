import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import { uploadS3, getUrlS3, getAudioS3 } from '../utils/s3.js';

const audioResolver = {
  Query: {
    async getAudioSignedUrl(_, { fileName }) {
      const signedUrl = await getUrlS3(fileName);
      return signedUrl;
    },
    async getAudio(_, { fileName }) {
      const audio = await getAudioS3(fileName);
      console.log(audio);
      return 'a';
    },
  },
};
export default audioResolver;
