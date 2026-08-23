import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import PlatformSeoEditorClient from "../PlatformSeoEditorClient";

export default async function EditPlatformSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  const { id } = await params;
  await dbConnect();

  const blog = await Blog.findOne({ _id: id, contentType: "platform-seo" }).lean();
  if (!blog) notFound();

  return (
    <PlatformSeoEditorClient
      authorId={session.user.id}
      editData={JSON.parse(JSON.stringify(blog))}
    />
  );
}
