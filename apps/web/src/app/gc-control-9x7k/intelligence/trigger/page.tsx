import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LiveTriggerClient from "@/components/admin/intelligence/LiveTriggerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Intelligence Trigger | Global Chanakya Admin",
};

export default async function LiveTriggerPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/404");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <LiveTriggerClient />
    </div>
  );
}
