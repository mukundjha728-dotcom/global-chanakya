import { Watchlist, IWatchlist } from "@/lib/models/Watchlist";
import dbConnect from "@/lib/mongoose";

export class WatchlistRepository {
  static async add(userId: string, entityType: string, entityId: string): Promise<IWatchlist | null> {
    await dbConnect();
    try {
      return await Watchlist.create({ userId, entityType, entityId });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) return null; // Duplicate key error
      throw error;
    }
  }

  static async remove(userId: string, entityType: string, entityId: string): Promise<boolean> {
    await dbConnect();
    const result = await Watchlist.deleteOne({ userId, entityType, entityId });
    return result.deletedCount > 0;
  }

  static async getByUser(userId: string): Promise<IWatchlist[]> {
    await dbConnect();
    return Watchlist.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async checkStatus(userId: string, entityType: string, entityId: string): Promise<boolean> {
    await dbConnect();
    const result = await Watchlist.exists({ userId, entityType, entityId });
    return !!result;
  }
}
