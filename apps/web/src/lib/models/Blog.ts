import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // TipTap HTML
  markdown?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  category: string;
  tags: string[];
  featuredImage?: string;
  visibility: "public" | "premium" | "private";
  publishAt: Date;
  earlyAccessUntil?: Date;
  status: "draft" | "published" | "archived";
  analytics: { views: number; likes: number };
  author: mongoose.Types.ObjectId;
  commentsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  markdown: { type: String },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  category: { type: String, required: true },
  tags: [{ type: String }],
  featuredImage: { type: String },
  visibility: { type: String, enum: ["public", "premium", "private"], default: "public" },
  publishAt: { type: Date, default: Date.now },
  earlyAccessUntil: { type: Date },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  commentsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
