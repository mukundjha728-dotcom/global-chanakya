import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogChunk extends Document {
  blogId: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  publishedAt: Date;
  chunkIndex: number;
  content: string;
  embedding: number[];
  embeddingModel: string;
  embeddingDimensions: number;
  contentHash: string;
  metadata: {
    sectionTitle?: string;
    parentHeading?: string;
    category?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const BlogChunkSchema = new Schema<IBlogChunk>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    publishedAt: { type: Date },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    embeddingModel: { type: String, required: true },
    embeddingDimensions: { type: Number, required: true },
    metadata: {
      sectionTitle: String,
      parentHeading: String,
      category: String,
      tags: [String]
    },
    contentHash: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

// We need an index on blogId, contentHash, and chunkIndex for idempotency and distributed lock
BlogChunkSchema.index({ blogId: 1, contentHash: 1, chunkIndex: 1 }, { unique: true });

export const BlogChunk = mongoose.models.BlogChunk || mongoose.model<IBlogChunk>('BlogChunk', BlogChunkSchema);
