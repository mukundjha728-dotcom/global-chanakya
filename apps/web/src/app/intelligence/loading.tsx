import React from "react";
import { Skeleton, SkeletonIntelligenceCard, PageHeaderSkeleton } from "@/components/ui/Skeleton";

export default function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-white">
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-12">
        <PageHeaderSkeleton />

        {/* Intelligence Command Center Quick Links Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 glass-card rounded-2xl border border-[var(--border)] flex flex-col gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-full h-4 mb-1" />
                <Skeleton className="w-5/6 h-4" />
              </div>
              <div className="mt-auto pt-4 border-t border-[var(--border)]/50">
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Live Feed Section Skeleton */}
        <div className="flex items-center justify-between mb-8">
           <Skeleton className="w-64 h-8" />
           <div className="flex gap-2">
             <Skeleton className="w-16 h-6 rounded-full" />
             <Skeleton className="w-20 h-6 rounded-full" />
             <Skeleton className="w-24 h-6 rounded-full" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonIntelligenceCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
