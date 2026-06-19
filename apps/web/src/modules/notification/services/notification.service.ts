import { Notification, INotification } from "@/lib/models/Notification";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";

export class NotificationService {
  static async createNotification(data: Partial<INotification>): Promise<INotification> {
    await dbConnect();
    return Notification.create(data);
  }

  static async getUserNotifications(userId: string, limit: number = 20): Promise<INotification[]> {
    await dbConnect();
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    await dbConnect();
    const result = await Notification.updateOne(
      { _id: notificationId, userId },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    await dbConnect();
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    await dbConnect();
    return Notification.countDocuments({ userId, isRead: false });
  }

  // Future logic: When a new Timeline Event is added, we query Watchlist for users following the entity,
  // and loop through to create Notifications. 
}
