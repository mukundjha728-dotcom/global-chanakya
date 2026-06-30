import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Like } from "@/lib/models/Like";
import { Bookmark } from "@/lib/models/Bookmark";
import { ReadingHistory } from "@/lib/models/ReadingHistory";
import { Comment } from "@/lib/models/Comment";

export async function GET(request: NextRequest) {
  const session = await auth();
  const sessionUserId = session?.user?.id || session?.user?.email;

  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findOne({ 
      $or: [{ _id: session?.user?.id }, { email: session?.user?.email }]
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userIdStr = user._id.toString();
    const userEmail = user.email;

    // Parallel aggregations for speed. Some models use string (email or id), some use ObjectId.
    // Bookmark uses ObjectId for userId. Like uses string. ReadingHistory uses string.
    const [likesCount, bookmarksCount, historyCount, commentsCount] = await Promise.all([
      Like.countDocuments({ user: { $in: [userIdStr, userEmail] } }),
      Bookmark.countDocuments({ userId: user._id }), 
      ReadingHistory.countDocuments({ user: { $in: [userIdStr, userEmail] } }),
      Comment.countDocuments({ user: user._id })
    ]);

    // Calculate reading time from history
    const historyData = await ReadingHistory.aggregate([
      { $match: { user: { $in: [userIdStr, userEmail] } } },
      { $group: { _id: null, totalTime: { $sum: "$totalReadTime" } } }
    ]);
    const totalReadingTimeSeconds = historyData[0]?.totalTime || 0;
    const totalReadingTimeMinutes = Math.floor(totalReadingTimeSeconds / 60);

    // Calculate engagement score
    const engagementScore = likesCount * 2 + bookmarksCount * 3 + commentsCount * 5 + historyCount;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        joinedAt: user.createdAt,
      },
      stats: {
        totalReads: historyCount,
        totalLikes: likesCount,
        totalBookmarks: bookmarksCount,
        totalComments: commentsCount,
        totalReadingTimeMinutes,
        engagementScore,
      }
    });

  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
