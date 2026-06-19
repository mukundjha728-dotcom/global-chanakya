import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Blog, IBlog } from "@/lib/models/Blog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the 20 most recent published blogs
    const blogs = await Blog.find({ status: "published" })
      .sort({ publishAt: -1 })
      .limit(20)
      .lean();

    const generateRssItem = (blog: IBlog) => `
      <item>
        <title><![CDATA[${blog.title}]]></title>
        <link>${SITE_URL}/blogs/${blog.slug}</link>
        <guid isPermaLink="true">${SITE_URL}/blogs/${blog.slug}</guid>
        <description><![CDATA[${blog.excerpt}]]></description>
        <category><![CDATA[${blog.category}]]></category>
        <pubDate>${new Date(blog.publishAt).toUTCString()}</pubDate>
      </item>
    `;

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>${SITE_NAME}</title>
          <link>${SITE_URL}</link>
          <description>${SITE_DESCRIPTION}</description>
          <language>en-us</language>
          <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
          ${blogs.map(generateRssItem).join("")}
        </channel>
      </rss>
    `;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("RSS generation failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
