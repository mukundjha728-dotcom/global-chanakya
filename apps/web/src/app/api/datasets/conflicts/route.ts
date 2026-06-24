/**
 * /api/datasets/conflicts/route.ts
 * Exposes a public, schema-structured JSON dataset of active global conflicts.
 * Acts as a massive backlink magnet for researchers and journalists.
 */
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Conflict } from "@/lib/models/Conflict";

export async function GET() {
  try {
    await dbConnect();
    
    const activeConflicts = await Conflict.find({ status: { $in: ["Active", "Escalating"] } })
      .select("title regions startDate casualties economicImpact")
      .sort({ startDate: -1 })
      .lean();

    const dataset = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Global Active Conflicts Dataset",
      description: "Real-time geopolitical dataset tracking active escalations, human cost, and economic impact.",
      creator: {
        "@type": "Organization",
        name: "Global Chanakya Intelligence"
      },
      license: "https://creativecommons.org/licenses/by/4.0/",
      dateModified: new Date().toISOString(),
      isAccessibleForFree: true,
      data: activeConflicts.map(c => ({
        id: c._id,
        conflictName: c.title,
        region: c.regions.join(", "),
        commencement: c.startDate,
        casualtiesEst: c.casualties || "Unknown",
        economicRisk: c.economicImpact || "Under Assessment"
      }))
    };

    return NextResponse.json(dataset, {
      headers: {
        "Cache-Control": "public, s-maxage=86400", // Cache for 24h
        "Access-Control-Allow-Origin": "*", // Fully public API for researchers
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate dataset" }, { status: 500 });
  }
}
