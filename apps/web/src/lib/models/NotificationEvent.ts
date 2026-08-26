import mongoose, { Schema, Document } from 'mongoose';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface INotificationEvent extends Document {
  eventType: 'INTELLIGENCE' | 'BLOG' | 'PLATFORM';
  eventId: string; // stringified ObjectId of the source document
  notificationType: 'INTELLIGENCE' | 'BLOG' | 'PLATFORM';
  status: NotificationStatus;
  attempts: number;
  createdAt: Date;
  sentAt?: Date;
  lastError?: string;
}

const NotificationEventSchema = new Schema<INotificationEvent>(
  {
    eventType: { type: String, required: true, enum: ['INTELLIGENCE', 'BLOG', 'PLATFORM'] },
    eventId: { type: String, required: true },
    notificationType: { type: String, required: true, enum: ['INTELLIGENCE', 'BLOG', 'PLATFORM'] },
    status: { type: String, required: true, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date },
    lastError: { type: String },
  },
  { timestamps: true }
);

// Ensure we cannot have two docs for the same event+type simultaneously
NotificationEventSchema.index({ eventType: 1, eventId: 1, notificationType: 1 }, { unique: true });

export const NotificationEvent =
  mongoose.models.NotificationEvent || mongoose.model<INotificationEvent>('NotificationEvent', NotificationEventSchema);
