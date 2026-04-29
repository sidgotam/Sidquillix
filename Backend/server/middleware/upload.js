import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ok = file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/');
  if (!ok) return cb(new ApiError(400, 'Only image/video files are allowed'));
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 40 * 1024 * 1024,
  },
});

