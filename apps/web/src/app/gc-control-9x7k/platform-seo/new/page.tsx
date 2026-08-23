import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PlatformSeoEditorClient from "../PlatformSeoEditorClient";

export default async function NewPlatformSeoPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  return <PlatformSeoEditorClient authorId={session.user.id} />;
}
