import Link from "next/link";
import { Search, Zap, Lock, Eye, Filter } from "lucide-react";
import { Blog } from "@/lib/models/Blog";
import dbConnect from "@/lib/mongoose";

export const metadata = {
  title: "Latest Intel",
  description: "Read the latest geopolitical reports and intelligence briefs.",
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as string | undefined;
  const trending = resolvedParams.trending === 'true';

  // Fetch blogs server-side (using mock logic if DB connection fails/empty)
  let blogs: any[] = [];
  try {
    await dbConnect();
    const query: any = { status: "published" };
    if (category) query.category = category;
    if (trending) query.isTrending = true;
    
    blogs = await Blog.find(query)
      .sort({ publishAt: -1 })
      .populate("author", "name avatar")
      .limit(20)
      .lean();
  } catch (error) {
    console.error("DB connection failed for blogs:", error);
  }

  // Fallback mock data if DB is empty
  if (blogs.length === 0) {
    blogs = [
      {
        _id: "1",
        title: "The Emerging Indo-Pacific Security Architecture",
        excerpt: "An in-depth analysis of strategic realignments in the South China Sea and the broader implications for global supply chains.",
        slug: "emerging-indo-pacific-security",
        category: "Indo-Pacific",
        visibility: "premium",
        publishAt: new Date().toISOString(),
        author: { name: "Global Chanakya Desk" },
      },
      {
        _id: "2",
        title: "Europe's Defence Autonomy Pivot",
        excerpt: "How recent geopolitical shifts are forcing the European Union to reconsider its long-standing security reliance on NATO and Washington.",
        slug: "europe-defence-autonomy",
        category: "Europe",
        visibility: "public",
        publishAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        author: { name: "Europe Desk" },
      }
    ];
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {trending ? "Trending Intel" : category ? `${category} Intelligence` : "Latest Reports"}
            </h1>
            <p className="text-gray-400">
              Unvarnished analysis and strategic foresight.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search intel..." 
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:border-rose-500/50 outline-none transition-colors"
              />
            </div>
            <button className="p-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-full hover:bg-white/[0.04] transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="flex flex-col group">
              <div className="relative aspect-[16/10] bg-[#111] rounded-2xl mb-4 overflow-hidden border border-white/[0.08]">
                {/* Fallback pattern if no image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-gray-300 border border-white/10">
                    {blog.category}
                  </span>
                </div>
                {blog.visibility === "premium" && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-amber-500/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Premium
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
                {blog.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                {blog.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                    {(blog.author?.name || "G")[0]}
                  </div>
                  <span>{blog.author?.name || "Global Chanakya"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{new Date(blog.publishAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
