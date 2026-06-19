import mongoose, { Schema, Document } from "mongoose";

export interface IDeviceSession extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  ip: string;
  userAgent: string;
  lastSeen: Date;
  isTrusted: boolean;
  createdAt: Date;
}

const DeviceSessionSchema = new Schema<IDeviceSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  lastSeen: { type: Date, default: Date.now },
  isTrusted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for fast lookup of a specific user's specific device
DeviceSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
DeviceSessionSchema.index({ userId: 1, lastSeen: -1 });

export const DeviceSession = mongoose.models.DeviceSession || mongoose.model<IDeviceSession>("DeviceSession", DeviceSessionSchema);
