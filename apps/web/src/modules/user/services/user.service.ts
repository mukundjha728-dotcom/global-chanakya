import { UserRepository } from "../repositories/user.repository";

export class UserService {
  static async getUserProfile(id: string) {
    return UserRepository.findById(id);
  }

  static async getUserByEmail(email: string) {
    return UserRepository.findByEmail(email);
  }

  static async upgradeUserRole(id: string, role: string) {
    // Audit logging can go here in the future
    return UserRepository.updateRole(id, role);
  }
}
