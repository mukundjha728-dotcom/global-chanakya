import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/404");
  }

  await dbConnect();
  const users = await User.find({}, {
    name: 1, email: 1, role: 1, provider: 1, isBanned: 1, createdAt: 1
  }).sort({ createdAt: -1 }).limit(100).lean();

  return <UsersTable users={JSON.parse(JSON.stringify(users))} />;
}
