import React from "react";
import { SkeletonCard, SkeletonIntelligenceCard, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {/* ─── HERO SKELETON ─── */}
      <section className="relative border-b border-[var(--border)] min-h-[calc(100vh-5rem)] flex items-center py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <Skeleton className="w-64 h-8 mb-8" />
              <Skeleton className="w-full h-16 md:h-20 mb-4" />
              <Skeleton className="w-5/6 h-16 md:h-20 mb-8" />
              
              <Skeleton className="w-4/5 h-6 mb-2" />
              <Skeleton className="w-3/4 h-6 mb-10" />

              <div className="flex gap-4">
                <Skeleton className="w-48 h-12 rounded-xl" />
                <Skeleton className="w-40 h-12 rounded-xl" />
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 w-full">
               <div className="w-full aspect-square sm:aspect-[4/5] max-h-[500px] md:max-h-[600px] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]/30 animate-pulse"></div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── LATEST REPORTS SKELETON ─── */}
      <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--surface)]/10">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex items-center gap-4 mb-12">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="w-64 h-8 mb-2" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             <SkeletonIntelligenceCard />
             <SkeletonIntelligenceCard />
             <SkeletonIntelligenceCard />
          </div>
        </div>
      </section>
    </div>
  );
}
