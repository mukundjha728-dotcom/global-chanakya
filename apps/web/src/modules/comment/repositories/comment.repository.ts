import { Comment } from "@/lib/models/Comment";
import dbConnect from "@/lib/mongoose";

export class CommentRepository {
  static async findByBlogId(blogId: string) {
    await dbConnect();
    return Comment.find({ blog: blogId, status: "approved" })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  static async create(data: { user: string; blog: string; content: string; status: string }) {
    await dbConnect();
    const comment = await Comment.create(data);
    return Comment.findById(comment._id)
      .populate("user", "name avatar")
      .lean();
  }
}
