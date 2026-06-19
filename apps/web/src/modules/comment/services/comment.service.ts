import { CommentRepository } from "../repositories/comment.repository";

export class CommentService {
  static async getCommentsForBlog(blogId: string) {
    return CommentRepository.findByBlogId(blogId);
  }

  static async createComment(data: { user: string; blog: string; content: string; status: string }) {
    return CommentRepository.create(data);
  }
}
