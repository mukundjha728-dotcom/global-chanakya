import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import PlatformSeoListClient from "./PlatformSeoListClient";

export default async function PlatformSeoAdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  await dbConnect();
  const blogs = await Blog.find(
    { contentType: "platform-seo" },
    {
      title: 1, slug: 1, status: 1, category: 1, visibility: 1,
      "analytics.views": 1, createdAt: 1, publishAt: 1,
    }
  )
    .sort({ createdAt: -1 })
    .lean();

  return <PlatformSeoListClient blogs={JSON.parse(JSON.stringify(blogs))} />;
}
