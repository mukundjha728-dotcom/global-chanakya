import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actor: mongoose.Types.ObjectId | null; // null = system action
  actorEmail?: string;
  action: string; // e.g. "user.login", "blog.publish", "user.ban"
  entity: {
    type: "User" | "Blog" | "Comment" | "Subscription" | "System";
    id?: string;
  };
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    entity: {
      type: { type: String, enum: ["User", "Blog", "Comment", "Subscription", "System"], required: true },
      id: { type: String },
    },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
  },
  { timestamps: true }
);

// TTL index — auto-delete audit logs older than 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
AuditLogSchema.index({ actor: 1, action: 1 });

export const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
