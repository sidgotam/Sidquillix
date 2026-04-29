import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Expression } from '../models/Expression.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';

export const createComment = asyncHandler(async (req, res) => {
  const { expressionId, text } = req.body;

  const expression = await Expression.findById(expressionId).select('_id userId');
  if (!expression) throw new ApiError(404, 'Expression not found');

  const comment = await Comment.create({
    expressionId,
    userId: req.user.id,
    text: String(text).trim(),
  });

  res.status(201).json({ success: true, comment });
});

export const getCommentsByExpression = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { expressionId } = req.params;

  if (!mongoose.isValidObjectId(expressionId)) throw new ApiError(400, 'Invalid expressionId');

  const [items, total] = await Promise.all([
    Comment.find({ expressionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name username profilePicture'),
    Comment.countDocuments({ expressionId }),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    comments: items,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const expression = await Expression.findById(comment.expressionId).select('userId');
  const isExpressionOwner = expression?.userId?.toString() === req.user.id;
  const isCommentOwner = comment.userId.toString() === req.user.id;

  if (!isExpressionOwner && !isCommentOwner) throw new ApiError(403, 'Forbidden');

  await Comment.deleteOne({ _id: comment._id });
  res.json({ success: true, message: 'Comment deleted' });
});

