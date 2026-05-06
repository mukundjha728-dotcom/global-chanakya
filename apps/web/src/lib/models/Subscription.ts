import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: "weekly_premium";
  paymentId: string;
  orderId?: string;
  amount: number; // in paise (₹19 = 1900)
  currency: string;
  expiresAt: Date;
  status: "active" | "expired" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["weekly_premium"], default: "weekly_premium" },
    paymentId: { type: String, required: true },
    orderId: { type: String },
    amount: { type: Number, required: true, default: 1900 }, // ₹19 in paise
    currency: { type: String, default: "INR" },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "failed", "refunded"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Auto-expire: TTL index won't delete docs but we query by expiresAt
SubscriptionSchema.index({ expiresAt: 1 });
SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
