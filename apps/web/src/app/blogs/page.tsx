import Link from "next/link";
import { Search, Zap, Eye, Filter, BookOpen, ArrowRight } from "lucide-react";
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
  const trending = resolvedParams.trending === "true";

  let blogs: any[] = [];
  try {
    await dbConnect();
    const query: any = { status: "published" };
    if (category) query.category = category;
    if (trending) query.isTrending = true;

    blogs = await Blog.find(query)
      .sort({ publishAt: -1 })
      .populate("author", "name")
      .limit(30)
      .lean();
  } catch (error) {
    console.error("DB connection failed for blogs:", error);
  }

  const categories = [
    "Geopolitics", "Defence", "Economy", "Diplomacy",
    "Indo-Pacific", "South Asia", "Europe", "Middle East",
    "China", "Russia", "USA", "Analysis",
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              {trending ? "🔥 Trending Intel" : category ? `${category} Intelligence` : "Latest Reports"}
            </h1>
            <p className="text-gray-500">
              Unvarnished analysis and strategic foresight.{" "}
              {blogs.length > 0 && (
                <span className="text-gray-600">{blogs.length} article{blogs.length !== 1 ? "s" : ""}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search intel..."
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:border-rose-500/50 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/blogs"
            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
              !category && !trending
                ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                category === cat
                  ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                  : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <BookOpen className="w-9 h-9 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {category ? `No ${category} articles yet` : "No articles published yet"}
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              {category
                ? `Be the first to read when we publish in the ${category} category.`
                : "Our editorial team is working on the first batch of reports. Check back soon for strategic intelligence briefs."}
            </p>
            <div className="flex gap-3">
              {category && (
                <Link
                  href="/blogs"
                  className="px-5 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm"
                >
                  View all articles
                </Link>
              )}
              <Link
                href="/subscribe"
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all text-sm font-medium flex items-center gap-1"
              >
                Get notified <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="flex flex-col group">
                <div className="relative aspect-[16/10] bg-[#111] rounded-2xl mb-4 overflow-hidden border border-white/[0.08]">
                  {blog.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-gray-300 border border-white/10">
                      {blog.category}
                    </span>
                  </div>
                  {blog.visibility === "premium" && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-amber-500/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Premium
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{blog.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 text-[10px] font-bold">
                      {(blog.author?.name || "G")[0]}
                    </div>
                    <span>{blog.author?.name || "Global Chanakya"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(blog.analytics?.views || 0).toLocaleString()}
                    </span>
                    <span>
                      {new Date(blog.publishAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
