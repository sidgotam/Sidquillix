import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createExpression,
  deleteExpression,
  getExpressionById,
  getExpressions,
  getMyExpressions,
  toggleLike,
  updateExpression,
} from '../controllers/expressionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const MOOD_ALIASES = {
  calm: 'casual',
  hype: 'trending',
  reflect: 'thoughtful',
  curious: 'motivated',
  bold: 'motivated',
  dreamy: 'emotional',
  motivated: 'motivated',
  thoughtful: 'thoughtful',
  emotional: 'emotional',
  casual: 'casual',
  trending: 'trending',
};
const CANONICAL_MOODS = ['motivated', 'thoughtful', 'emotional', 'casual', 'trending'];

function normalizeMood(value) {
  if (typeof value !== 'string') return value;
  return MOOD_ALIASES[value.trim().toLowerCase()] || value.trim().toLowerCase();
}

router.post(
  '/',
  authMiddleware,
  upload.array('media', 10),
  [
    body('mood').customSanitizer(normalizeMood).isIn(CANONICAL_MOODS).withMessage('Invalid mood'),
    body('text').optional().isString().isLength({ max: 5000 }),
    body('media').optional(),
    validate,
  ],
  createExpression
);

router.get(
  '/',
  [
    query('mood').optional().customSanitizer(normalizeMood).isIn(CANONICAL_MOODS),
    query('mediaType').optional().isIn(['text', 'image', 'video', 'hybrid']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validate,
  ],
  getExpressions
);

router.get(
  '/me',
  authMiddleware,
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 }), validate],
  getMyExpressions
);

router.get('/:id', [param('id').isMongoId(), validate], getExpressionById);

router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isMongoId(),
    body('text').isString().isLength({ min: 1, max: 5000 }),
    validate,
  ],
  updateExpression
);

router.delete('/:id', authMiddleware, [param('id').isMongoId(), validate], deleteExpression);

router.put('/:id/like', authMiddleware, [param('id').isMongoId(), validate], toggleLike);

export default router;

