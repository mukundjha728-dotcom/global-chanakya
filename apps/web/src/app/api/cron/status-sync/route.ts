import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { Conflict } from "@/lib/models/Conflict";
import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Alliance } from "@/lib/models/Alliance";
import { Timeline } from "@/lib/models/Timeline";
import { Region } from "@/lib/models/Region";
import { AuditLog } from "@/lib/models/AuditLog";

// Vercel Cron handler
export async function GET(request: Request) {
  // Check Vercel Cron Secret for authorization
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await dbConnect();
  const now = new Date();
  
  const models = [
    { name: "Blog", model: Blog },
    { name: "Conflict", model: Conflict },
    { name: "Country", model: Country },
    { name: "Leader", model: Leader },
    { name: "Alliance", model: Alliance },
    { name: "Timeline", model: Timeline },
    { name: "Region", model: Region },
  ];

  let publishedCount = 0;
  let unpublishedCount = 0;
  let breakingResetCount = 0;
  let featuredResetCount = 0;

  for (const { name, model } of models) {
    if (!model) continue;

    // 1. Publish Scheduled Content
    // Find drafts or scheduled items where publishAt <= now
    const toPublish = await model.find({
      status: { $in: ["draft", "scheduled"] },
      publishAt: { $lte: now },
      isDeleted: false
    });

    for (const doc of toPublish) {
      doc.status = "published";
      await doc.save();
      
      await AuditLog.create({
        userId: "SYSTEM_CRON",
        action: "PUBLISH",
        entityType: name,
        entityId: doc._id,
        timestamp: new Date()
      });
      publishedCount++;
    }

    // 2. Unpublish Expired Content
    const toUnpublish = await model.find({
      status: "published",
      unpublishAt: { $lte: now },
      isDeleted: false
    });

    for (const doc of toUnpublish) {
      doc.status = "archived";
      await doc.save();
      
      await AuditLog.create({
        userId: "SYSTEM_CRON",
        action: "ARCHIVE",
        entityType: name,
        entityId: doc._id,
        timestamp: new Date()
      });
      unpublishedCount++;
    }

    // 3. Reset Breaking Status
    const toResetBreaking = await model.find({
      isBreaking: true,
      breakingUntil: { $lte: now },
      isDeleted: false
    });

    for (const doc of toResetBreaking) {
      doc.isBreaking = false;
      await doc.save();
      breakingResetCount++;
    }

    // 4. Reset Featured Status
    const toResetFeatured = await model.find({
      isFeatured: true,
      featuredUntil: { $lte: now },
      isDeleted: false
    });

    for (const doc of toResetFeatured) {
      doc.isFeatured = false;
      await doc.save();
      featuredResetCount++;
    }
  }

  return NextResponse.json({
    success: true,
    message: "Cron sync executed successfully",
    timestamp: now,
    stats: {
      publishedCount,
      unpublishedCount,
      breakingResetCount,
      featuredResetCount
    }
  });
}
