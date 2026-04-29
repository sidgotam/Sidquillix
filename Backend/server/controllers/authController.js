import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { buildMediaItemFromUploadResult, uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  const normalizedName = String(name || '').trim();
  const normalizedUsername = String(username || '').trim();

  const existing = await User.findOne({
    $or: [{ email }, { username: normalizedUsername }],
  });
  if (existing?.email === email) throw new ApiError(409, 'Email already in use');
  if (existing?.username === normalizedUsername) throw new ApiError(409, 'User already exists');

  const user = await User.create({ name: normalizedName, username: normalizedUsername, email, password });
  const token = signToken({ id: user._id.toString() });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ id: user._id.toString() });

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  const nextName = typeof req.body.name === 'string' ? req.body.name.trim() : user.name;
  if (!nextName || nextName.length < 2 || nextName.length > 50) {
    throw new ApiError(400, 'Name must be between 2 and 50 characters');
  }

  const nextUsername = typeof req.body.username === 'string' ? req.body.username.trim() : user.username;
  if (!nextUsername || nextUsername.length < 2 || nextUsername.length > 30) {
    throw new ApiError(400, 'Username must be between 2 and 30 characters');
  }

  const usernameOwner = await User.findOne({ username: nextUsername }).select('_id');
  if (usernameOwner && usernameOwner._id.toString() !== user._id.toString()) {
    throw new ApiError(409, 'User already exists');
  }

  user.name = nextName;
  user.username = nextUsername;

  const file = req.file;
  if (file) {
    const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
    if (!isImage) throw new ApiError(400, 'Profile picture must be an image');
    const result = await uploadBufferToCloudinary(file.buffer, {
      folder: 'nexify/profiles',
      resource_type: 'image',
    });
    user.profilePicture = buildMediaItemFromUploadResult(file, result).url;
  }

  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
});

