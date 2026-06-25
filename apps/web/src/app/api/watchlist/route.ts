import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { watchlistSchema } from "@/lib/validators/watchlist.schema";
import { WatchlistService } from "@/modules/watchlist/services/watchlist.service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = watchlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: (validation.error as any).errors[0].message }, { status: 400 });
    }

    const { entityType, entityId } = validation.data;
    const result = await WatchlistService.toggleFollow(session.user.id, entityType, entityId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Watchlist API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: check specific entity status if query params provided
    const url = new URL(req.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");

    if (entityType && entityId) {
      const isFollowing = await WatchlistService.isFollowing(session.user.id, entityType, entityId);
      return NextResponse.json({ isFollowing });
    }

    // Otherwise return entire watchlist
    const watchlist = await WatchlistService.getUserWatchlist(session.user.id);
    return NextResponse.json(watchlist);
  } catch (error) {
    console.error("Watchlist API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
