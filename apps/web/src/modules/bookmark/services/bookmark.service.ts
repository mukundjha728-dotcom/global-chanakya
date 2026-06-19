import { BookmarkRepository } from "../repositories/bookmark.repository";

export class BookmarkService {
  static async toggleBookmark(userId: string, blogId: string) {
    const isBookmarked = await BookmarkRepository.checkStatus(userId, blogId);

    if (isBookmarked) {
      await BookmarkRepository.remove(userId, blogId);
      return { status: "removed" };
    } else {
      await BookmarkRepository.add(userId, blogId);
      return { status: "added" };
    }
  }

  static async getUserBookmarks(userId: string) {
    return BookmarkRepository.getByUser(userId);
  }

  static async isBookmarked(userId: string, blogId: string) {
    return BookmarkRepository.checkStatus(userId, blogId);
  }
}
