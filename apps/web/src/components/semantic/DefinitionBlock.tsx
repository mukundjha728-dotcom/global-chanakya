import React from "react";
import { BookOpen } from "lucide-react";

interface DefinitionBlockProps {
  term: string;
  definition: string;
}

export function DefinitionBlock({ term, definition }: DefinitionBlockProps) {
  if (!term || !definition) return null;

  return (
    <aside className="my-6 p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 text-sm" aria-label={`Definition of ${term}`}>
      <div className="flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
        <div>
          <dfn className="font-bold text-emerald-400 block mb-1 not-italic">{term}</dfn>
          <span className="text-gray-300">{definition}</span>
        </div>
      </div>
    </aside>
  );
}
