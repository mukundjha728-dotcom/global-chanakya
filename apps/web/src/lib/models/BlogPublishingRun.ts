import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryResult {
  category: string;
  status: "PENDING" | "RUNNING" | "PUBLISHED" | "SKIPPED" | "FAILED" | "RETRYING";
  blogId?: mongoose.Types.ObjectId;
  topic?: string;
  reportType?: string;
  reason?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  duplicateRejections: number;
  researchData?: any;
}

export interface IBlogPublishingRun extends Document {
  runId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED" | "CANCELLED";
  startedAt?: Date;
  completedAt?: Date;
  currentCategory?: string;
  totalCategories: number;
  completedCategories: number;
  skippedCategories: number;
  failedCategories: number;
  publishedBlogIds: mongoose.Types.ObjectId[];
  duplicateRejections: number;
  retryCount: number;
  errorDetails?: string;
  lastUpdatedAt: Date;
  isDryRun: boolean;
  categoryResults: ICategoryResult[];
  tavilySearchCalls?: number;
}

const CategoryResultSchema = new Schema<ICategoryResult>(
  {
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "PUBLISHED", "SKIPPED", "FAILED", "RETRYING"],
      default: "PENDING",
    },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
    topic: { type: String },
    reportType: { type: String },
    reason: { type: String },
    error: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    retryCount: { type: Number, default: 0 },
    duplicateRejections: { type: Number, default: 0 },
    researchData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const BlogPublishingRunSchema = new Schema<IBlogPublishingRun>(
  {
    runId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["QUEUED", "RUNNING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED", "CANCELLED"],
      default: "QUEUED",
      index: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    currentCategory: { type: String },
    totalCategories: { type: Number, default: 0 },
    completedCategories: { type: Number, default: 0 },
    skippedCategories: { type: Number, default: 0 },
    failedCategories: { type: Number, default: 0 },
    publishedBlogIds: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    duplicateRejections: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },
    errorDetails: { type: String },
    lastUpdatedAt: { type: Date, default: Date.now },
    isDryRun: { type: Boolean, default: false },
    categoryResults: [CategoryResultSchema],
    tavilySearchCalls: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-update lastUpdatedAt
BlogPublishingRunSchema.pre("save", async function () {
  this.lastUpdatedAt = new Date();
});

export const BlogPublishingRun =
  mongoose.models.BlogPublishingRun ||
  mongoose.model<IBlogPublishingRun>("BlogPublishingRun", BlogPublishingRunSchema);
