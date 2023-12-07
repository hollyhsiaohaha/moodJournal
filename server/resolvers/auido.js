import FormData from 'form-data';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { throwCustomError, ErrorTypes } from '../utils/errorHandler.js';
import { getUrlS3, getAudioS3 } from '../utils/s3.js';

const { OPENAI_API_KEY } = process.env;

const audioResolver = {
  Query: {
    async getAudioSignedUrl(_, { fileName }) {
      const signedUrl = await getUrlS3(fileName);
      return signedUrl;
    },
    async voiceToText(_, { fileName }) {
      const { buffer, contentType, knownLength } = await getAudioS3(fileName);
      const formData = new FormData();
      formData.append('file', buffer, {
        contentType: contentType,
        knownLength: knownLength,
        filename: fileName,
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'zh');
      formData.append('response_format', 'json');
      formData.append('initial_prompt', '繁體中文');

      const headers = formData.getHeaders ? formData.getHeaders() : {};
      headers['Authorization'] = `Bearer ${OPENAI_API_KEY}`;
      try {
        const res = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
          headers,
        });
        return res.data.text;
      } catch (error) {
        logger.error(error.stack);
        throwCustomError(error.message, ErrorTypes.BAD_REQUEST);
      }
    },
  },
};
export default audioResolver;
