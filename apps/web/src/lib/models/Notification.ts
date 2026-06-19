import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "critical";
  triggerType: "watchlist_event" | "conflict_escalation" | "leader_update";
  targetEntity?: {
    entityType: string;
    entityId: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "critical"],
    default: "normal",
  },
  triggerType: {
    type: String,
    enum: ["watchlist_event", "conflict_escalation", "leader_update"],
    required: true,
  },
  targetEntity: {
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
