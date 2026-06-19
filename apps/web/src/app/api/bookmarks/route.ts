import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookmarkSchema } from "@/lib/validators/bookmark.schema";
import { BookmarkService } from "@/modules/bookmark/services/bookmark.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = bookmarkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { blogId } = validation.data;
    const result = await BookmarkService.toggleBookmark(session.user.id, blogId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bookmark API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const blogId = url.searchParams.get("blogId");

    if (blogId) {
      const isBookmarked = await BookmarkService.isBookmarked(session.user.id, blogId);
      return NextResponse.json({ isBookmarked });
    }

    const bookmarks = await BookmarkService.getUserBookmarks(session.user.id);
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Bookmark API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
