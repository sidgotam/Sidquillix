import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createComment, deleteComment, getCommentsByExpression } from '../controllers/commentController.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  [body('expressionId').isMongoId(), body('text').isString().trim().isLength({ min: 1, max: 500 }), validate],
  createComment
);

router.get(
  '/:expressionId',
  [param('expressionId').isMongoId(), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 50 }), validate],
  getCommentsByExpression
);

router.delete('/:id', authMiddleware, [param('id').isMongoId(), validate], deleteComment);

export default router;

