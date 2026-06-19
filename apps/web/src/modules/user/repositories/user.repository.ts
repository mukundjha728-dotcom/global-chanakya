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
}
