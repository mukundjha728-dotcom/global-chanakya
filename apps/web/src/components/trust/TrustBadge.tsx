import React from "react";
import { ShieldCheck, CalendarCheck, FileBadge } from "lucide-react";

interface TrustBadgeProps {
  authorName: string;
  isVerified: boolean;
  lastUpdated: string;
  sourceCount: number;
}

export function TrustBadge({ authorName, isVerified, lastUpdated, sourceCount }: TrustBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-800 bg-gray-900/20 my-6 text-xs text-gray-400">
      <div className="flex items-center gap-1.5" title="Author Verification">
        {isVerified ? (
          <ShieldCheck className="w-4 h-4 text-blue-500" />
        ) : (
          <FileBadge className="w-4 h-4 text-gray-500" />
        )}
        <span className="font-semibold text-gray-300">Analysis by {authorName}</span>
      </div>

      <div className="flex items-center gap-1.5" title="Last Verified Update">
        <CalendarCheck className="w-4 h-4 text-emerald-500" />
        <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-1.5" title="Verified Primary & Secondary Sources">
        <FileBadge className="w-4 h-4 text-purple-500" />
        <span>{sourceCount} Verified Sources</span>
      </div>
      
      <div className="ml-auto">
        <span className="px-2 py-1 bg-gray-800 rounded text-[10px] uppercase tracking-wider font-bold">
          Strict Neutrality Enforced
        </span>
      </div>
    </div>
  );
}
