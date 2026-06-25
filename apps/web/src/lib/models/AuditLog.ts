import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId | string;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId | string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.Mixed, required: true }, // Mixed to allow "SYSTEM" or ObjectId
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.Mixed },
  beforeSnapshot: { type: Schema.Types.Mixed },
  afterSnapshot: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Indexes for fast querying in admin dashboards
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
