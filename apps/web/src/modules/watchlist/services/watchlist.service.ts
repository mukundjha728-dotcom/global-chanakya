import { WatchlistRepository } from "../repositories/watchlist.repository";
import { NotificationService } from "@/modules/notification/services/notification.service";

export class WatchlistService {
  static async toggleFollow(userId: string, entityType: string, entityId: string) {
    const isFollowing = await WatchlistRepository.checkStatus(userId, entityType, entityId);

    if (isFollowing) {
      await WatchlistRepository.remove(userId, entityType, entityId);
      return { status: "unfollowed" };
    } else {
      await WatchlistRepository.add(userId, entityType, entityId);
      return { status: "followed" };
    }
  }

  static async getUserWatchlist(userId: string) {
    return WatchlistRepository.getByUser(userId);
  }

  static async isFollowing(userId: string, entityType: string, entityId: string) {
    return WatchlistRepository.checkStatus(userId, entityType, entityId);
  }
}
