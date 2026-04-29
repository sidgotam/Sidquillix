import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, 'Unauthorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

