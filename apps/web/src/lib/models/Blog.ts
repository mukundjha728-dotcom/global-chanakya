import mongoose, { Schema, Document } from "mongoose";

export interface IBlogRevision {
  content: string;
  title: string;
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  note?: string;
}

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
    canonicalUrl?: string;
    schemaMarkup?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: string;
  visibility: "public" | "premium" | "private";
  publishAt: Date;
  earlyAccessUntil?: Date; // publishAt + 24 hours for non-premium users
  status: "draft" | "published" | "archived" | "scheduled";
  analytics: {
    views: number;
    likes: number;
    bookmarks: number;
    readTime: number; // in minutes
    ctr: number; // click through rate %
  };
  revisions: IBlogRevision[];
  author: mongoose.Types.ObjectId;
  commentsEnabled: boolean;
  isTrending: boolean;
  readingTime?: number; // auto-calculated
  createdAt: Date;
  updatedAt: Date;
}

const BlogRevisionSchema = new Schema<IBlogRevision>(
  {
    content: { type: String, required: true },
    title: { type: String, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    markdown: { type: String },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
      schemaMarkup: { type: String },
    },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    featuredImage: { type: String },
    visibility: {
      type: String,
      enum: ["public", "premium", "private"],
      default: "public",
    },
    publishAt: { type: Date, default: Date.now },
    earlyAccessUntil: { type: Date }, // Set automatically: publishAt + 24h
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
    },
    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      readTime: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
    },
    revisions: [BlogRevisionSchema],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentsEnabled: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    readingTime: { type: Number },
  },
  { timestamps: true }
);

// Auto-set earlyAccessUntil = publishAt + 24 hours on save
BlogSchema.pre("save", function (next) {
  if (this.isModified("publishAt") || !this.earlyAccessUntil) {
    const publishDate = this.publishAt || new Date();
    this.earlyAccessUntil = new Date(publishDate.getTime() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Compound indexes for performance
BlogSchema.index({ status: 1, publishAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ "analytics.views": -1 });

export const Blog =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
