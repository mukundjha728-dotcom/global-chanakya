import mongoose, { Schema, Document } from "mongoose";

export interface ITimelineEvent extends Document {
  title: string;
  description: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  eventDate: Date;
  entityType: "country" | "leader" | "conflict";
  entityId: mongoose.Types.ObjectId;
  severity: "critical" | "major" | "normal" | "minor";
  tags: string[];
  createdAt: Date;
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  breakingUntil?: Date;
  featuredUntil?: Date;
}

const TimelineSchema = new Schema<ITimelineEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  eventDate: { type: Date, required: true },
  entityType: {
    type: String,
    enum: ["country", "leader", "conflict"],
    required: true,
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  severity: {
    type: String,
    enum: ["critical", "major", "normal", "minor"],
    default: "normal",
  },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },

    version: { type: Number, default: 1 },
    previousVersions: [{ type: Schema.Types.Mixed }],
    draftSnapshot: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    breakingUntil: { type: Date },
    featuredUntil: { type: Date },});

// Optimized index for chronological timeline queries
TimelineSchema.index({ entityType: 1, entityId: 1, eventDate: -1 });

export const Timeline = mongoose.models.Timeline || mongoose.model<ITimelineEvent>("Timeline", TimelineSchema);
