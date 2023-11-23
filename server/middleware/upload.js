import multer from 'multer';

const storage = multer.memoryStorage({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg') cb(null, true);
  else {
    req.fileValidationError = `Goes wrong on the mimetype: ${file?.originalname}`;
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

const audioUpload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter,
});

export const audioUploadMiddleware = audioUpload.single('audio');
