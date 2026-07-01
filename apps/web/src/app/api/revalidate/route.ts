import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { notifyGoogleIndexingAPI, IndexingAction } from "@/lib/seo/indexing";
import { SITE_URL } from "@/constants";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    
    // In production, require a secret token to prevent abuse
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const body = await req.json();
    const { type, slug, action } = body as { type: string, slug?: string, action?: IndexingAction };

    if (type === "blog" && slug) {
      // Revalidate cache
      revalidatePath(`/blogs/${slug}`);
      revalidatePath("/blogs");
      revalidatePath("/sitemap.xml");
      revalidateTag("blogs");

      // Notify Google Indexing API
      const url = `${SITE_URL}/blogs/${slug}`;
      const notified = await notifyGoogleIndexingAPI(url, action || "URL_UPDATED");
      
      return NextResponse.json({ 
        revalidated: true, 
        message: `Revalidated blog: ${slug}`,
        googleNotified: notified
      });
    }

    return NextResponse.json({ message: "Invalid payload or type unsupported" }, { status: 400 });

  } catch (err) {
    console.error("Revalidation API error:", err);
    return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
  }
}
