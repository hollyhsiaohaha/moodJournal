import express from 'express';
import { audioUploadMiddleware } from '../middleware/upload.js';
import { validateJwtMiddleware } from '../middleware/authentication.js';
import { uploadS3 } from '../utils/s3.js';
import { logger } from '../utils/logger.js';
import { getGoogleAuthUrl } from '../utils/googleApi.js';

const router = express.Router();

router.post('/audio', validateJwtMiddleware, audioUploadMiddleware, async (req, res, next) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const extension = originalname.split('.').pop();
    const fileName = `${Date.now()}.${extension}`;
    await uploadS3(fileName, buffer, mimetype);
    res.send({ fileName });
  } catch (error) {
    logger.error(error.stack);
    next(error);
  }
});

router.get('/auth/google', validateJwtMiddleware, async (req, res, next) => {
  const authUrl = await getGoogleAuthUrl();
  res.json({ authUrl });
});
// TODO: 為啥都導不到！！！！
router.get('/auth/google/callback', async (req, res) => {
  // const { code } = req.query;
  res.send('a');
  // const { tokens } = await oAuth2Client.getToken(code);
  // oAuth2Client.setCredentials(tokens);
  // req.session.tokens = tokens;

  // const profile = await getUserProfile(oAuth2Client);
  // // Save user profile data in the session

  // req.session.userProfile = profile;
  // userProfileData = profile;
  // res.redirect('http://localhost:3000/dashboard');

  // res.redirect("/fetch-data");
  // } catch (error) {
  //   console.error("Error retrieving access token:", error);
  //   res.redirect("/error");
  // }
});

export default router;
