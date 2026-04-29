import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    expressionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expression', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  },
  { timestamps: true }
);

commentSchema.index({ expressionId: 1, createdAt: -1 });

export const Comment = mongoose.model('Comment', commentSchema);

