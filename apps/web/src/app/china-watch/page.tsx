import React from "react";
import { Metadata } from "next";
import { TrendingEngine } from "@/components/growth/TrendingEngine";
import { NewsletterForm } from "@/components/growth/NewsletterForm";
import { TopicSubscription } from "@/components/growth/TopicSubscription";
import { BlogService } from "@/modules/blog/services/blog.service";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "China Watch | Strategic Intelligence & Geopolitical Analysis",
  description: "Comprehensive strategic intelligence on China's foreign policy, military expansion, trade wars, and internal power dynamics.",
};

// ISR 6 hours
export const revalidate = 21600;

export default async function ChinaWatchPage() {
  const blogs = await BlogService.searchBlogs("China", 10);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <header className="mb-12 border-b border-gray-800 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">China Watch</h1>
          <TopicSubscription topicId="china" topicName="China" type="Country" />
        </div>
        <p className="text-xl text-gray-400 max-w-3xl">
          Deep-dive intelligence on Beijing's strategic moves, the Belt and Road Initiative, and Sino-Global relations.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
           <div className="space-y-6">
              {blogs.length === 0 ? (
                <EmptyState 
                  title="No Intel Available" 
                  description="There are currently no intelligence reports specifically covering China." 
                />
              ) : (
                blogs.map((blog) => (
                  <Link href={`/blogs/${blog.slug}`} key={blog._id?.toString() || blog.slug} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-colors group">
                    <div className="w-full sm:w-48 h-32 bg-gray-800 rounded-xl shrink-0 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={blog.featuredImage || "/images/fallback-geopolitics.jpg"} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{blog.category}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(blog.publishAt || blog.createdAt), { addSuffix: true })}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-500 transition-colors">{blog.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{blog.excerpt}</p>
                    </div>
                  </Link>
                ))
              )}
           </div>
        </div>
        
        <aside className="space-y-8">
          <NewsletterForm type="Country Watch" entityName="China" />
          <TrendingEngine />
        </aside>
      </div>
    </div>
  );
}
