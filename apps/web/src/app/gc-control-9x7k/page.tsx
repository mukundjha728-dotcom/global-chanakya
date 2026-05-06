import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Blog } from "@/lib/models/Blog";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/404");
  }

  await dbConnect();
  const [totalUsers, totalBlogs, premiumUsers, recentUsers] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments(),
    User.countDocuments({ role: "premium" }),
    User.find({}, { name: 1, email: 1, role: 1, provider: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const stats = {
    totalUsers,
    totalBlogs,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers - 1, // minus admin
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
  };

  return <AdminDashboard stats={stats} />;
}
