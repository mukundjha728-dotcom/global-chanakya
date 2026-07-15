import { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { Country } from "@/lib/models/Country";
import { Blog } from "@/lib/models/Blog";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string }> }): Promise<Metadata> {
  const { countrySlug } = await params;
  return {
    title: `${countrySlug.toUpperCase()} | Intelligence Dashboard | Global Chanakya`,
    description: `Comprehensive geopolitical intelligence, history, and statistics for ${countrySlug}.`,
  };
}

export default async function CountryPage({ params }: { params: Promise<{ countrySlug: string }> }) {
  const { countrySlug } = await params;
  await dbConnect();

  // Fetch country data (if exists)
  const country = await Country.findOne({ slug: countrySlug }).lean();
  
  // Fetch latest 5 blogs published for this country
  const latestBlogs = await Blog.find({ 
    countrySlug: countrySlug,
    status: "published"
  }).sort({ publishAt: -1 }).limit(5).lean();

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-8">
          <div className="w-32 h-20 bg-gray-800 rounded flex items-center justify-center text-sm">Flag Placeholder</div>
          <div>
            <h1 className="text-5xl font-bold text-[#D4AF37] capitalize">{country?.name || countrySlug}</h1>
            <p className="text-xl text-gray-400 mt-2">{country?.officialName || "Official Name Placeholder"}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#0B1220] p-4 rounded border border-gray-800">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Capital</p>
            <p className="text-2xl font-bold mt-1">{country?.capital || "N/A"}</p>
          </div>
          <div className="bg-[#0B1220] p-4 rounded border border-gray-800">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Population</p>
            <p className="text-2xl font-bold mt-1">{country?.population || "N/A"}</p>
          </div>
          <div className="bg-[#0B1220] p-4 rounded border border-gray-800">
            <p className="text-gray-500 text-sm uppercase tracking-wider">GDP</p>
            <p className="text-2xl font-bold mt-1">{country?.stats?.gdp || "N/A"}</p>
          </div>
          <div className="bg-[#0B1220] p-4 rounded border border-gray-800">
            <p className="text-gray-500 text-sm uppercase tracking-wider">Military Rank</p>
            <p className="text-2xl font-bold mt-1">{country?.stats?.militaryRank ? `#${country.stats.militaryRank}` : "N/A"}</p>
          </div>
        </div>

        {/* Overview & Geopolitics */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Strategic Overview</h2>
              <div className="text-gray-300 leading-relaxed bg-[#0B1220] p-6 rounded border border-gray-800 prose prose-invert">
                {country?.overview || "Detailed geopolitical overview and strategic importance goes here..."}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Latest Intelligence Reports</h2>
              {latestBlogs.length === 0 ? (
                <p className="text-gray-500 italic bg-[#0B1220] p-4 rounded border border-gray-800">No reports published for this country yet.</p>
              ) : (
                <div className="grid gap-4">
                  {latestBlogs.map((blog: any) => (
                    <Link key={blog._id} href={`/blogs/${blog.slug}`} className="bg-[#0B1220] p-5 rounded border border-gray-800 hover:border-[#D4AF37] transition group block">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{blog.category}</span>
                        <span className="text-xs text-gray-500">{new Date(blog.publishAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition">{blog.title}</h3>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{blog.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-[#0B1220] p-6 rounded border border-gray-800">
              <h3 className="font-bold text-[#D4AF37] mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-400">
                <li><a href={`/countries/${countrySlug}/history`} className="hover:underline">History & Origins</a></li>
                <li><a href={`/countries/${countrySlug}/military`} className="hover:underline">Military & Defense</a></li>
                <li><a href={`/countries/${countrySlug}/economy`} className="hover:underline">Economic Profile</a></li>
                <li><a href={`/countries/${countrySlug}/politics`} className="hover:underline">Government & Politics</a></li>
                <li><a href={`/countries/${countrySlug}/blog`} className="hover:underline">Latest Intelligence Reports</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
