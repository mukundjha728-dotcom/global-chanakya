import React from "react";
import { Metadata } from "next";
import { TrendingEngine } from "@/components/growth/TrendingEngine";
import { NewsletterForm } from "@/components/growth/NewsletterForm";
import { TopicSubscription } from "@/components/growth/TopicSubscription";

export const metadata: Metadata = {
  title: "China Watch | Strategic Intelligence & Geopolitical Analysis",
  description: "Comprehensive strategic intelligence on China's foreign policy, military expansion, trade wars, and internal power dynamics.",
};

// ISR 6 hours
export const revalidate = 21600;

export default function ChinaWatchPage() {
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
           {/* Placeholder for Dynamic Blogs targeting "China" */}
           <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <article key={i} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="w-full sm:w-48 h-32 bg-gray-800 rounded-xl shrink-0"></div>
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 block">Economic Strategy</span>
                    <h3 className="text-xl font-bold text-white mb-2">The Semiconductor Silk Road</h3>
                    <p className="text-sm text-gray-400">Analysis of the recent supply chain restructuring and its impact on the Indo-Pacific tech alliances.</p>
                  </div>
                </article>
              ))}
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
