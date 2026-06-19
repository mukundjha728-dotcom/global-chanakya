import mongoose, { Schema, Document } from "mongoose";

export interface ITimelineEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  entityType: "country" | "leader" | "conflict";
  entityId: mongoose.Types.ObjectId;
  severity: "critical" | "major" | "normal" | "minor";
  tags: string[];
  createdAt: Date;
}

const TimelineSchema = new Schema<ITimelineEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
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
});

// Optimized index for chronological timeline queries
TimelineSchema.index({ entityType: 1, entityId: 1, eventDate: -1 });

export const Timeline = mongoose.models.Timeline || mongoose.model<ITimelineEvent>("Timeline", TimelineSchema);
