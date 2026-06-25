import { SystemConfig, ISystemConfig } from "@/lib/models/SystemConfig";
import dbConnect from "@/lib/mongoose";
import { memoryCache } from "@/lib/cache/memory.cache";

export class SystemService {
  static async getConfig(): Promise<ISystemConfig | null> {
    const cacheKey = `system:config:active`;
    const cached = await memoryCache.get<ISystemConfig>(cacheKey);
    if (cached) return cached;

    await dbConnect();
    let data = await SystemConfig.findOne({ isActive: true }).lean();
    
    // If no active config exists, create a default one
    if (!data) {
      data = await SystemConfig.create({
        isActive: true,
        navigation: { mainLinks: [], dropdowns: [] },
        footer: { columns: [], copyrightText: "© Global Chanakya Intelligence" },
        announcementBar: { isActive: false, message: "" },
        homepage: { 
          heroTitle: "Global Intelligence Reimagined", 
          heroSubtitle: "Strategic analysis and breaking alerts from the world's most critical theatres.",
          heroCtaPrimary: { label: "Create Free Account", href: "/auth/signup" },
          heroCtaSecondary: { label: "Explore Reports", href: "/blogs" },
          featuredContentSlots: []
        },
        globalSeo: { metaTitleFallback: "Global Chanakya", metaDescriptionFallback: "Global Intelligence Reimagined" }
      });
      // Convert to lean object for consistency
      data = JSON.parse(JSON.stringify(data));
    }

    if (data) {
      await memoryCache.set(cacheKey, data as ISystemConfig, 3600); // cache for 1 hour
    }
    return data as ISystemConfig | null;
  }
}
