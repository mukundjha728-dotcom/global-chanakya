import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongoose";
import { SystemConfig } from "@/lib/models/SystemConfig";

export async function GET(request: Request) {
  try {
    await connectMongo();
    let config = await SystemConfig.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      config = await SystemConfig.create({
        version: 1,
        isActive: true,
        navigation: { mainLinks: [], dropdowns: [] },
        footer: { columns: [], copyrightText: "© Global Chanakya Intelligence" },
        homepage: { sections: [] },
        globalSeo: { 
          metaTitleFallback: "Global Chanakya", 
          metaDescriptionFallback: "Geopolitical Intelligence",
          robotsConfig: "index, follow",
          canonicalDefaults: "",
          schemaOverrides: "",
          llmsTxtSections: ""
        },
        growth: {
          announcementBar: { isActive: false, message: "" },
          newsletterConfig: "",
          trendingRules: ""
        }
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectMongo();
    const data = await request.json();
    
    // Create new version instead of overwriting, or just update the active one.
    // For simplicity, we update the active one here.
    let config = await SystemConfig.findOne().sort({ createdAt: -1 });
    
    if (!config) {
      config = new SystemConfig(data);
    } else {
      Object.assign(config, data);
      config.version += 1;
    }
    
    await config.save();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
