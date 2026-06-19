import Link from "next/link";
import { Search, Crown, Eye, Heart, Bookmark, Newspaper, ArrowRight, TrendingUp } from "lucide-react";
import { Blog, IBlog } from "@/lib/models/Blog";
import { formatDate } from "@repo/utils";
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

  let blogs: IBlog[] = [];
  try {
    await dbConnect();
    const query: Record<string, unknown> = { status: "published" };
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
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#060606]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {trending ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-[11px] font-semibold uppercase tracking-[0.08em] rounded-md border border-red-500/20">
                  <TrendingUp className="w-3.5 h-3.5" /> Trending Intel
                </span>
              ) : category ? (
                <span className="px-3 py-1 bg-white/[0.04] text-neutral-400 text-[11px] font-semibold uppercase tracking-[0.08em] rounded-md border border-white/[0.08]">
                  {category}
                </span>
              ) : null}
            </div>
            
            <h1 className="text-4xl md:text-[44px] font-bold mb-3 text-white leading-tight tracking-[-0.02em]">
              {trending ? "Most Read Reports" : category ? `${category} Intelligence` : "Latest Reports"}
            </h1>
            <p className="text-[15px] text-neutral-400">
              Unvarnished analysis and strategic foresight.{" "}
              {blogs.length > 0 && (
                <span className="text-neutral-500">
                  {blogs.length} article{blogs.length !== 1 ? "s" : ""} available
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search intelligence..."
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-white focus:border-red-500/50 focus:bg-white/[0.04] outline-none transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href="/blogs"
            className={`px-4 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
              !category && !trending
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            All Reports
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-lg border text-[13px] font-medium transition-colors ${
                category === cat
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6">
              <Newspaper className="w-8 h-8 text-neutral-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {category ? `No ${category} reports yet` : "No reports published yet"}
            </h2>
            <p className="text-[14px] text-neutral-500 max-w-md mb-8">
              {category
                ? `Be the first to read when our analysts publish in the ${category} theatre.`
                : "Our editorial team is working on the first batch of reports. Check back soon for strategic intelligence briefs."}
            </p>
            <div className="flex gap-3">
              {category && (
                <Link
                  href="/blogs"
                  className="px-5 py-2.5 rounded-lg border border-white/[0.1] text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors text-[13px] font-medium"
                >
                  View all reports
                </Link>
              )}
              <Link
                href="/subscribe"
                className="px-5 py-2.5 rounded-lg bg-white text-[#060606] hover:bg-neutral-200 transition-colors text-[13px] font-semibold flex items-center gap-1.5"
              >
                Get notified <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id.toString()} href={`/blogs/${blog.slug}`} className="flex flex-col group p-3 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all">
                <div className="relative aspect-[16/10] bg-neutral-900 rounded-xl mb-4 overflow-hidden">
                  {blog.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-[#060606] group-hover:scale-[1.03] transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/80 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-semibold tracking-wider uppercase text-neutral-300 border border-white/10">
                      {blog.category}
                    </span>
                  </div>
                  {blog.visibility === "premium" && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> Premium
                    </div>
                  )}
                </div>

                <div className="px-1 flex flex-col flex-1">
                  <h3 className="text-[17px] font-semibold text-white mb-2 leading-snug line-clamp-2 group-hover:text-neutral-300 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-neutral-500 text-[13px] leading-relaxed line-clamp-2 mb-4 flex-1">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-bold">
                        {(blog.author?.name || "G")[0]}
                      </div>
                      <span className="text-[12px] text-neutral-400 font-medium">
                        {blog.author?.name?.split(" ")[0] || "Global Chanakya"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(blog.analytics?.views || 0).toLocaleString()}
                      </span>
                      <span>
                        {formatDate(blog.publishAt, "short")}
                      </span>
                    </div>
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
