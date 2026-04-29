import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true, enum: ['image', 'video'] },
  },
  { _id: false }
);

const expressionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' },
    media: { type: [mediaItemSchema], default: [] },
    mood: {
      type: String,
      required: true,
      enum: ['motivated', 'thoughtful', 'emotional', 'casual', 'trending'],
      index: true,
    },
    likes: { type: Number, default: 0 },
    likedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

expressionSchema.index({ createdAt: -1 });

export const Expression = mongoose.model('Expression', expressionSchema);

