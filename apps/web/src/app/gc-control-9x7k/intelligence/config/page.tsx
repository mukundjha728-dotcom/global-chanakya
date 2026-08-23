import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SystemConfigClient from "@/components/admin/intelligence/SystemConfigClient";

export default async function IntelligenceConfigPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  return <SystemConfigClient />;
}
