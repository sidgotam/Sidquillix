import mongoose from 'mongoose';
import { Expression } from '../models/Expression.js';
import { Comment } from '../models/Comment.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';
import { buildMediaItemFromUploadResult, uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

function parseMediaFromBody(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

function buildFilter(query) {
  const filter = {};

  if (query.mood) filter.mood = query.mood;

  const mediaType = query.mediaType;
  if (mediaType === 'text') {
    filter.text = { $exists: true, $ne: '' };
  } else if (mediaType === 'image' || mediaType === 'video') {
    filter.media = { $elemMatch: { type: mediaType } };
  } else if (mediaType === 'hybrid') {
    filter.text = { $exists: true, $ne: '' };
    filter.media = { $exists: true, $not: { $size: 0 } };
  }

  if (query.userId && mongoose.isValidObjectId(query.userId)) {
    filter.userId = query.userId;
  }

  return filter;
}

export const createExpression = asyncHandler(async (req, res) => {
  const { text = '', mood } = req.body;

  const bodyMedia = parseMediaFromBody(req.body.media);
  const files = req.files || [];

  let media = Array.isArray(bodyMedia) ? bodyMedia : [];

  if (files.length) {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: 'nexify/expressions',
          resource_type: 'auto',
        });
        return buildMediaItemFromUploadResult(file, result);
      })
    );
    media = media.concat(uploaded);
  }

  const trimmedText = String(text || '').trim();
  if (!trimmedText && media.length === 0) {
    throw new ApiError(400, 'Expression must include text, media, or both');
  }

  const expression = await Expression.create({
    userId: req.user.id,
    text: trimmedText,
    media,
    mood,
  });

  res.status(201).json({ success: true, expression });
});

export const getExpressions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Expression.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name username profilePicture'),
    Expression.countDocuments(filter),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    expressions: items,
  });
});

export const getMyExpressions = asyncHandler(async (req, res) => {
  req.query.userId = req.user.id;
  return getExpressions(req, res);
});

export const getExpressionById = asyncHandler(async (req, res) => {
  const expression = await Expression.findById(req.params.id).populate('userId', 'name username profilePicture bio');
  if (!expression) throw new ApiError(404, 'Expression not found');
  res.json({ success: true, expression });
});

export const updateExpression = asyncHandler(async (req, res) => {
  const expression = await Expression.findById(req.params.id);
  if (!expression) throw new ApiError(404, 'Expression not found');

  if (expression.userId.toString() !== req.user.id) throw new ApiError(403, 'Forbidden');
  const nextText = String(req.body.text || '').trim();
  expression.text = nextText;

  await expression.save();
  res.json({ success: true, expression });
});

export const deleteExpression = asyncHandler(async (req, res) => {
  const expression = await Expression.findById(req.params.id);
  if (!expression) throw new ApiError(404, 'Expression not found');

  if (expression.userId.toString() !== req.user.id) throw new ApiError(403, 'Forbidden');

  await Promise.all([Expression.deleteOne({ _id: expression._id }), Comment.deleteMany({ expressionId: expression._id })]);

  res.json({ success: true, message: 'Expression deleted' });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const expression = await Expression.findById(req.params.id);
  if (!expression) throw new ApiError(404, 'Expression not found');

  const userId = req.user.id;
  const idx = expression.likedBy.findIndex((id) => id.toString() === userId);

  let liked;
  if (idx >= 0) {
    expression.likedBy.splice(idx, 1);
    liked = false;
  } else {
    expression.likedBy.push(userId);
    liked = true;
  }

  expression.likes = expression.likedBy.length;
  await expression.save();

  res.json({ success: true, liked, likes: expression.likes });
});

