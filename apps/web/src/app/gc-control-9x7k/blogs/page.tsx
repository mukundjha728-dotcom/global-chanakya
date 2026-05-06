import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import AdminBlogsClient from "@/components/admin/AdminBlogsClient";

export default async function AdminBlogsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/404");

  await dbConnect();
  const blogs = await Blog.find({}, {
    title: 1, slug: 1, status: 1, category: 1, visibility: 1,
    "analytics.views": 1, createdAt: 1, publishAt: 1, isTrending: 1,
  }).sort({ createdAt: -1 }).limit(100).lean();

  return <AdminBlogsClient blogs={JSON.parse(JSON.stringify(blogs))} />;
}
