import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  if (err?.code === 11000) {
    const fields = Object.keys(err?.keyPattern || {});
    const field = fields[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already in use`,
    });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  const payload = {
    success: false,
    message: err?.message || 'Server error',
  };

  if (err instanceof ApiError && err.details) payload.details = err.details;

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err?.stack;
  }

  res.status(statusCode).json(payload);
}

