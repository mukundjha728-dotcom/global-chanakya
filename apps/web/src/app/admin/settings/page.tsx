import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  return <AdminSettingsClient user={session.user} />;
}
