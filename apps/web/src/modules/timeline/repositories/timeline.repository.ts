import { Timeline, ITimelineEvent } from "@/lib/models/Timeline";
import dbConnect from "@/lib/mongoose";

export class TimelineRepository {
  static async getEventsForEntity(entityType: string, entityId: string): Promise<ITimelineEvent[]> {
    await dbConnect();
    return Timeline.find({ entityType, entityId })
      .sort({ eventDate: -1 })
      .lean();
  }

  static async getRecentEvents(limit: number = 20): Promise<ITimelineEvent[]> {
    await dbConnect();
    return Timeline.find()
      .sort({ eventDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
