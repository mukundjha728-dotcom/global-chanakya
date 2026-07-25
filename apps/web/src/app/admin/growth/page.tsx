import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminGrowthClient from "@/components/admin/AdminGrowthClient";

export const metadata = {
  title: "Growth Dashboard | Admin | Global Chanakya",
};

export default async function GrowthDashboardPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "admin") {
    redirect("/404");
  }

  return <AdminGrowthClient />;
}
