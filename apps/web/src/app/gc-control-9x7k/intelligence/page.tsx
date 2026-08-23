import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import LiveEventsClient from "@/components/admin/intelligence/LiveEventsClient";

export default async function LiveIntelligencePage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/404");

  await dbConnect();
  
  // Fetch latest 200 events for admin
  const events = await IntelligenceEvent.find({}, {
    title: 1, source: 1, url: 1, publishedAt: 1, status: 1,
    impactLevel: 1, chunkIndex: 1, countries: 1,
    createdAt: 1
  }).sort({ publishedAt: -1 }).limit(200).lean();

  return <LiveEventsClient events={JSON.parse(JSON.stringify(events))} />;
}
