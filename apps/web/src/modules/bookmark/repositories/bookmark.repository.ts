import { Bookmark, IBookmark } from "@/lib/models/Bookmark";
import dbConnect from "@/lib/mongoose";

export class BookmarkRepository {
  static async add(userId: string, blogId: string): Promise<IBookmark | null> {
    await dbConnect();
    try {
      return await Bookmark.create({ userId, blogId });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) return null; // Duplicate
      throw error;
    }
  }

  static async remove(userId: string, blogId: string): Promise<boolean> {
    await dbConnect();
    const result = await Bookmark.deleteOne({ userId, blogId });
    return result.deletedCount > 0;
  }

  static async getByUser(userId: string): Promise<IBookmark[]> {
    await dbConnect();
    return Bookmark.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async checkStatus(userId: string, blogId: string): Promise<boolean> {
    await dbConnect();
    const result = await Bookmark.exists({ userId, blogId });
    return !!result;
  }
}
