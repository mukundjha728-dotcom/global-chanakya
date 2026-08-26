import mongoose, { Schema, Document } from 'mongoose';

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: mongoose.Types.ObjectId; // optional link to a user
  preferences: {
    intelligence: boolean;
    blogs: boolean;
    platform: boolean;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    preferences: {
      intelligence: { type: Boolean, default: true },
      blogs: { type: Boolean, default: true },
      platform: { type: Boolean, default: true },
    },
    active: { type: Boolean, default: true },
    lastSuccessAt: { type: Date },
    lastFailureAt: { type: Date },
  },
  { timestamps: true }
);

export const PushSubscription =
  mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
