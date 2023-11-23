import express from 'express';
import { audioUploadMiddleware } from '../middleware/upload.js';
import { validateJwtMiddleware } from '../middleware/authentication.js';
import { uploadS3 } from '../utils/s3.js';

const router = express.Router();

router.post('/audio', validateJwtMiddleware, audioUploadMiddleware, async (req, res, next) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const fileName = `${Date.now()}.${originalname.split('.').pop()}`;
    await uploadS3(fileName, buffer, mimetype);
    res.send({ fileName });
  } catch (error) {
    next(error);
  }
});

export default router;
