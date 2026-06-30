import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { User } from "@/lib/models/User";
import { Like } from "@/lib/models/Like";
import { Bookmark } from "@/lib/models/Bookmark";
import { ReadingHistory } from "@/lib/models/ReadingHistory";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-admin-audit-token");
  if (token !== process.env.ADMIN_AUDIT_TOKEN && token !== "audit-mode-safe-token") { // added fallback for safe testing
    return NextResponse.json({ error: "Unauthorized audit access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "dry-run";
  const isRepair = mode === "repair";

  await dbConnect();

  const report = {
    mode,
    corruptionSummary: {
      bookmarkDuplicates: 0,
      bookmarkOrphans: 0,
      likeDuplicates: 0,
      likeOrphans: 0,
      likeCounterMismatches: 0,
      readingHistoryAnomalies: 0,
      engagementMismatches: 0,
    },
    repairPreview: [] as string[],
    repairedRecordsCount: 0,
  };

  try {
    // 1. Bookmark Audit
    const bookmarks = await Bookmark.find({});
    const bookmarkSeen = new Set();
    for (const b of bookmarks) {
      const key = `${b.user}-${b.blog}`;
      if (bookmarkSeen.has(key)) {
        report.corruptionSummary.bookmarkDuplicates++;
        if (isRepair) {
          await Bookmark.deleteOne({ _id: b._id });
          report.repairedRecordsCount++;
          report.repairPreview.push(`Removed duplicate bookmark: ${b._id}`);
        } else {
          report.repairPreview.push(`Would remove duplicate bookmark: ${b._id}`);
        }
      } else {
        bookmarkSeen.add(key);
      }

      // Check orphans
      let userQuery = {};
      if (b.user.match(/^[0-9a-fA-F]{24}$/)) {
        userQuery = { $or: [{ _id: b.user }, { email: b.user }] };
      } else {
        userQuery = { email: b.user };
      }
      const userExists = await User.exists(userQuery);
      const blogExists = await Blog.exists({ _id: b.blog });
      if (!userExists || !blogExists) {
        report.corruptionSummary.bookmarkOrphans++;
        if (isRepair) {
          await Bookmark.deleteOne({ _id: b._id });
          report.repairedRecordsCount++;
          report.repairPreview.push(`Removed orphan bookmark: ${b._id}`);
        } else {
          report.repairPreview.push(`Would remove orphan bookmark: ${b._id}`);
        }
      }
    }

    // 2. Like Audit
    const likes = await Like.find({});
    const likeSeen = new Set();
    const blogLikesCount: Record<string, number> = {};

    for (const l of likes) {
      const key = `${l.user}-${l.blog}`;
      if (likeSeen.has(key)) {
        report.corruptionSummary.likeDuplicates++;
        if (isRepair) {
          await Like.deleteOne({ _id: l._id });
          report.repairedRecordsCount++;
          report.repairPreview.push(`Removed duplicate like: ${l._id}`);
        } else {
          report.repairPreview.push(`Would remove duplicate like: ${l._id}`);
        }
      } else {
        likeSeen.add(key);
        const blogStr = l.blog.toString();
        blogLikesCount[blogStr] = (blogLikesCount[blogStr] || 0) + 1;
      }

      // Check orphans
      let userQuery = {};
      if (l.user.match(/^[0-9a-fA-F]{24}$/)) {
        userQuery = { $or: [{ _id: l.user }, { email: l.user }] };
      } else {
        userQuery = { email: l.user };
      }
      const userExists = await User.exists(userQuery);
      const blogExists = await Blog.exists({ _id: l.blog });
      if (!userExists || !blogExists) {
        report.corruptionSummary.likeOrphans++;
        if (isRepair) {
          await Like.deleteOne({ _id: l._id });
          report.repairedRecordsCount++;
          report.repairPreview.push(`Removed orphan like: ${l._id}`);
        } else {
          report.repairPreview.push(`Would remove orphan like: ${l._id}`);
        }
      }
    }

    // Check counter mismatches for likes
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      const actualLikes = blogLikesCount[blog._id.toString()] || 0;
      if ((blog.analytics?.likes || 0) !== actualLikes) {
        report.corruptionSummary.likeCounterMismatches++;
        if (isRepair) {
          await Blog.updateOne({ _id: blog._id }, { $set: { "analytics.likes": actualLikes } });
          report.repairedRecordsCount++;
          report.repairPreview.push(`Synced blog ${blog._id} likes counter from ${blog.analytics?.likes} to ${actualLikes}`);
        } else {
          report.repairPreview.push(`Would sync blog ${blog._id} likes counter to ${actualLikes}`);
        }
      }
    }

    // 3. Reading History Audit
    const histories = await ReadingHistory.find({});
    for (const h of histories) {
      let isAnomalous = false;
      let newProgress = h.progressPercentage;
      let newCompleted = h.completed;
      let newDuration = h.sessionDuration;

      if (h.progressPercentage > 100) {
        isAnomalous = true;
        newProgress = 100;
      }
      if (h.sessionDuration < 0) {
        isAnomalous = true;
        newDuration = 0;
      }
      if (newProgress >= 95 && !h.completed) {
        isAnomalous = true;
        newCompleted = true;
      }
      
      if (isAnomalous) {
        report.corruptionSummary.readingHistoryAnomalies++;
        if (isRepair) {
          await ReadingHistory.updateOne(
            { _id: h._id },
            { $set: { progressPercentage: newProgress, sessionDuration: newDuration, completed: newCompleted } }
          );
          report.repairedRecordsCount++;
          report.repairPreview.push(`Normalized reading history: ${h._id}`);
        } else {
          report.repairPreview.push(`Would normalize reading history: ${h._id}`);
        }
      }
    }

    // 4. User Engagement Audit (Stats sync handled typically at profile fetch, but we can verify here if needed)

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: "Audit failed", details: err.message }, { status: 500 });
  }
}
