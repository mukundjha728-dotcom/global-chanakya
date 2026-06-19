import mongoose, { Schema, Document } from "mongoose";

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optimized indexing: compound unique index to prevent duplicate bookmarks
BookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });
// Index for user queries sorted by recency
BookmarkSchema.index({ userId: 1, createdAt: -1 });

export const Bookmark = mongoose.models.Bookmark || mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
