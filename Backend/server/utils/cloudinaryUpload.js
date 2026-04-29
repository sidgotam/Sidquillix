import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from './ApiError.js';

function isVideoMime(mimetype) {
  return typeof mimetype === 'string' && mimetype.startsWith('video/');
}

export async function uploadBufferToCloudinary(buffer, options = {}) {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(500, 'Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    upload.end(buffer);
  });
}

export function buildMediaItemFromUploadResult(file, result) {
  return {
    url: result.secure_url,
    type: isVideoMime(file.mimetype) ? 'video' : 'image',
  };
}

