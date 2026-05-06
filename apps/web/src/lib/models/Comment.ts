import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  content: string;
  status: "approved" | "pending" | "spam";
  replies: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["approved", "pending", "spam"], default: "approved" },
  replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
