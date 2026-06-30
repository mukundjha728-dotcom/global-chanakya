import mongoose, { Schema, Document } from "mongoose";

export interface IReadingHistory extends Document {
  user: string;
  blog: mongoose.Types.ObjectId;
  progressPercentage: number;
  sessionDuration: number; // total time in seconds
  completed: boolean;
  resumePoint: number; // scroll position px
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  idleTime: number; // total time idle in seconds
  lastInteractionAt: Date;
}

const ReadingHistorySchema = new Schema<IReadingHistory>(
  {
    user: { type: String, required: true },
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    progressPercentage: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    resumePoint: { type: Number, default: 0 },
    deviceType: { type: String, enum: ["desktop", "mobile", "tablet", "unknown"], default: "unknown" },
    idleTime: { type: Number, default: 0 },
    lastInteractionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReadingHistorySchema.index({ user: 1, blog: 1 }, { unique: true });
ReadingHistorySchema.index({ user: 1, lastInteractionAt: -1 });

export const ReadingHistory = mongoose.models.ReadingHistory || mongoose.model<IReadingHistory>("ReadingHistory", ReadingHistorySchema);
