import React from "react";
import { List } from "lucide-react";

interface SummaryBlockProps {
  executiveSummary: string;
  keyInsights: string[];
}

export function SummaryBlock({ executiveSummary, keyInsights }: SummaryBlockProps) {
  if (!executiveSummary) return null;

  return (
    <aside className="my-8 p-6 bg-gray-900/60 border-l-4 border-blue-500 rounded-r-xl" aria-label="Executive Summary">
      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <List className="w-4 h-4" /> Executive Summary
      </h3>
      <div className="text-gray-200 text-lg leading-relaxed font-serif" itemProp="abstract">
        {executiveSummary}
      </div>
      
      {keyInsights && keyInsights.length > 0 && (
        <div className="mt-6 border-t border-gray-800 pt-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Key Strategic Insights</h4>
          <ul className="space-y-2">
            {keyInsights.map((insight, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-gray-300">
                <span className="text-blue-500 font-bold">•</span>
                <span itemProp="keywords">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
