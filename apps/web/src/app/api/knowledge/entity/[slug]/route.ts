/**
 * /api/knowledge/entity/[slug]/route.ts
 * Internal API returning semantic graph data for an entity.
 */
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";
import { Blog } from "@/lib/models/Blog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    // Fast parallel lookup across entities
    const [country, leader, conflict] = await Promise.all([
      Country.findOne({ slug }).lean(),
      Leader.findOne({ slug }).lean(),
      Conflict.findOne({ slug }).lean()
    ]);

    const entity = country || leader || conflict;
    
    if (!entity) {
      return NextResponse.json({ error: "Entity not found in Knowledge Graph" }, { status: 404 });
    }

    const type = country ? "Country" : leader ? "Leader" : "Conflict";

    // Fetch semantically related content from blogs
    const relatedContent = await Blog.find({
      "entityRelations.targetId": entity._id
    })
    .select("title slug aiSummary keyInsights tags publishAt")
    .sort({ publishAt: -1 })
    .limit(5)
    .lean();

    return NextResponse.json({
      entity: {
        id: entity._id,
        type,
        name: entity.name || entity.title,
        overview: entity.overview || entity.bio,
      },
      graph: {
        relationships: type === "Country" ? entity.relatedConflicts : type === "Leader" ? entity.associatedConflicts : entity.involvedParties,
        semanticNeighbors: relatedContent.map(b => b.slug),
        strategicTags: entity.tags || [],
      },
      content: relatedContent
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
