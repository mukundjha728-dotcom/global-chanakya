import { AuditLog } from "@/lib/models/AuditLog";
import dbConnect from "@/lib/mongoose";

export class AuditService {
  static async log(
    actorId: string,
    action: string,
    targetType: string,
    targetId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await dbConnect();
      await AuditLog.create({
        actorId,
        action,
        targetType,
        targetId,
        metadata,
      });
    } catch (error) {
      console.error("[AUDIT LOG ERROR] Failed to write audit log:", error);
      // We explicitly swallow the error here to ensure core business flows don't crash
      // due to an audit logging failure, but log it loudly to the console.
    }
  }

  static async getLogs(limit: number = 50, skip: number = 0) {
    await dbConnect();
    return AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}
