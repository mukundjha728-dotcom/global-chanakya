import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WriteArticleClient from "@/components/admin/WriteArticleClient";

export default async function WriteArticlePage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  return <WriteArticleClient authorId={session.user.id} />;
}
