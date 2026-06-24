import React from "react";
import { SourceCard, SourceProps, SourceType } from "./SourceCard";

interface SourceCategoryProps {
  category: SourceType;
  sources: SourceProps[];
}

export function SourceCategory({ category, sources }: SourceCategoryProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-800 pb-2">
        {category} Sources ({sources.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <SourceCard key={`${source.url}-${index}`} {...source} type={category} /> // Ensure type overrides for safety
        ))}
      </div>
    </div>
  );
}
