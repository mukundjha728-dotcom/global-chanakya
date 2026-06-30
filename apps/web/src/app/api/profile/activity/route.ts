import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { Like } from "@/lib/models/Like";
import { Bookmark } from "@/lib/models/Bookmark";
import { ReadingHistory } from "@/lib/models/ReadingHistory";

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "history"; // "history", "likes", "bookmarks"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    let items = [];
    let total = 0;

    if (type === "history") {
      [items, total] = await Promise.all([
        ReadingHistory.find({ user: { $in: [userIdStr, userEmail] } })
          .sort({ lastReadAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("blog", "title slug excerpt featuredImage category publishAt analytics")
          .lean(),
        ReadingHistory.countDocuments({ user: { $in: [userIdStr, userEmail] } })
      ]);
    } else if (type === "likes") {
      [items, total] = await Promise.all([
        Like.find({ user: { $in: [userIdStr, userEmail] } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("blog", "title slug excerpt featuredImage category publishAt analytics")
          .lean(),
        Like.countDocuments({ user: { $in: [userIdStr, userEmail] } })
      ]);
    } else if (type === "bookmarks") {
      [items, total] = await Promise.all([
        Bookmark.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("blogId", "title slug excerpt featuredImage category publishAt analytics")
          .lean(),
        Bookmark.countDocuments({ userId: user._id })
      ]);
      // Normalize to match other structures
      items = items.map(b => ({ ...b, blog: b.blogId }));
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Filter out null blogs (if they were deleted)
    const validItems = items.filter(item => item.blog != null);

    return NextResponse.json({
      items: validItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Profile Activity API error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
