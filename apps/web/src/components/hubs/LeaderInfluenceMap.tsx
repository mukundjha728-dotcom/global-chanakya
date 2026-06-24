import React from "react";
import { Target, Users, ShieldAlert } from "lucide-react";

interface LeaderInfluenceMapProps {
  leader: any;
}

export function LeaderInfluenceMap({ leader }: LeaderInfluenceMapProps) {
  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
      <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <Target className="w-5 h-5 text-emerald-400" />
        Spheres of Influence
      </h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Global Alliances
          </h4>
          {leader.alliances && leader.alliances.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {leader.alliances.map((alliance: string) => (
                <span key={alliance} className="px-3 py-1 bg-gray-800 text-sm font-medium text-gray-200 rounded-lg border border-gray-700">
                  {alliance}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No major alliances recorded.</p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Associated Conflicts
          </h4>
          {leader.associatedConflicts && leader.associatedConflicts.length > 0 ? (
            <ul className="space-y-2">
              {leader.associatedConflicts.map((c: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                  {c.title || c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No direct conflict involvement.</p>
          )}
        </div>
      </div>
    </div>
  );
}
