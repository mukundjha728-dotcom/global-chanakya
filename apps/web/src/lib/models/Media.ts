import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  cloudinaryId: string;
  url: string;
  type: string;
  size: number;
  altText?: string;
  usageReferences?: string[];
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  cloudinaryId: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  altText: { type: String },
  usageReferences: [{ type: String }],
  uploadedBy: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

MediaSchema.index({ createdAt: -1 });

export const Media = mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
