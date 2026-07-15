import mongoose, { Schema, Document } from "mongoose";

export interface ICountryBlogRevision {
  content: string;
  title: string;
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  note?: string;
}

export interface ICountryBlog extends Document {
  // Assignment
  country: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId; // References CountryCategory
  tags: mongoose.Types.ObjectId[]; // References CountryTag

  // Basic Information
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  gallery: string[];

  // Content
  content: string; // Rich Text (TipTap HTML)
  markdown?: string;
  mapEmbeds?: string[];
  youtubeEmbeds?: string[];
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;

  // Publishing
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt: Date;
  unpublishAt?: Date;
  author: mongoose.Types.ObjectId;
  
  // System / Analytics
  analytics: {
    views: number;
    likes: number;
    bookmarks: number;
    readTime: number;
  };
  revisions: ICountryBlogRevision[];
  isTrending: boolean;
  isBreaking?: boolean;
  isFeatured?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const CountryBlogRevisionSchema = new Schema<ICountryBlogRevision>(
  {
    content: { type: String, required: true },
    title: { type: String, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    editedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const CountryBlogSchema = new Schema<ICountryBlog>(
  {
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "CountryCategory", required: true, index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "CountryTag" }],

    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    featuredImage: { type: String },
    gallery: [{ type: String }],

    content: { type: String, required: true },
    markdown: { type: String },
    mapEmbeds: [{ type: String }],
    youtubeEmbeds: [{ type: String }],

    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    canonicalUrl: { type: String },
    ogImage: { type: String },

    status: {
      type: String,
      enum: ["draft", "published", "scheduled", "archived"],
      default: "draft",
    },
    publishAt: { type: Date, default: Date.now },
    unpublishAt: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      readTime: { type: Number, default: 0 },
    },
    revisions: [CountryBlogRevisionSchema],
    isTrending: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CountryBlogSchema.pre("validate", function () {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  } else if (this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
});

// Compound indexes for performance
CountryBlogSchema.index({ country: 1, category: 1, status: 1 });
CountryBlogSchema.index({ status: 1, publishAt: -1 });

export const CountryBlog =
  mongoose.models.CountryBlog || mongoose.model<ICountryBlog>("CountryBlog", CountryBlogSchema);
