import { User, IUser } from "@/lib/models/User";
import dbConnect from "@/lib/mongoose";

export class UserRepository {
  static async findById(id: string): Promise<IUser | null> {
    await dbConnect();
    return User.findById(id).lean();
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    await dbConnect();
    return User.findOne({ email }).lean();
  }

  static async updateRole(id: string, role: string): Promise<IUser | null> {
    await dbConnect();
    return User.findByIdAndUpdate(id, { $set: { role } }, { new: true }).lean();
  }

  static async updateUserStatus(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    await dbConnect();
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
  }

  static async getAllUsers(): Promise<IUser[]> {
    await dbConnect();
    return User.find(
      {},
      { name: 1, email: 1, role: 1, provider: 1, isBanned: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();
  }
}
