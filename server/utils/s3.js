import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import stream from 'stream';
import { throwCustomError, ErrorTypes } from './errorHandler.js';
import { logger } from './logger.js';

const { BUCKET_NAME } = process.env;
const { BUCKET_REGION } = process.env;
const { BUCKET_ACCESS_KEY } = process.env;
const { BUCKET_SECRET_ACCESS_KEY } = process.env;

const s3 = new S3Client({
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

export async function uploadS3(key, buffer, type) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: type,
  };
  const command = new PutObjectCommand(params);
  s3.send(command);
}

export async function getUrlS3(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

export async function getAudioS3(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const command = new GetObjectCommand(params);
  try {
    const res = await s3.send(command);
    // return res;
    if (res.Body && res.Body instanceof stream.Readable) {
      const contentType = res.ContentType;
      const knownLength = res.ContentLength;
      return new Promise((resolve, reject) => {
        const chunks = [];
        res.Body.on('data', (chunk) => chunks.push(chunk));
        res.Body.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType, knownLength });
        });
        res.Body.on('error', reject);
      });
    } else {
      throwCustomError('[S3] incorrect file type when get object', ErrorTypes.BAD_REQUEST);
    }
  } catch (error) {
    logger.error(error);
    throwCustomError(`[S3] ${error.message}`, ErrorTypes.BAD_REQUEST);
  }
}
