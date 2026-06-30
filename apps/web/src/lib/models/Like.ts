import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  user: string;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: String, required: true },
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, blog: 1 }, { unique: true });
LikeSchema.index({ user: 1, createdAt: -1 });

export const Like = mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);
