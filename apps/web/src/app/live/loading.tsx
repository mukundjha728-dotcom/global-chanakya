import React from "react";
import { Skeleton, PageHeaderSkeleton } from "@/components/ui/Skeleton";

export default function LiveLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeaderSkeleton />

        {/* Filters Skeleton */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex gap-4 items-center">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-32 h-8 rounded" />
          <Skeleton className="w-32 h-8 rounded" />
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <article key={i} className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <Skeleton className="w-24 h-6 rounded" />
                  <Skeleton className="w-32 h-6 rounded" />
                </div>
                <Skeleton className="w-24 h-4 rounded" />
              </div>
              <Skeleton className="w-3/4 h-8 mb-3" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-5/6 h-4 mb-4" />
              <div className="border-t pt-4 flex gap-4">
                <Skeleton className="w-48 h-4 rounded" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
