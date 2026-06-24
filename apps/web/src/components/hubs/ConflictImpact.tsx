import React from "react";
import { TrendingDown, Users } from "lucide-react";

interface ConflictImpactProps {
  economicImpact?: string;
  casualties?: string;
}

export function ConflictImpact({ economicImpact, casualties }: ConflictImpactProps) {
  if (!economicImpact && !casualties) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
        Global Impact
      </h2>
      <div className="space-y-4">
        {casualties && (
          <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800 flex gap-4 items-start">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Human Cost</h3>
              <p className="text-gray-200">{casualties}</p>
            </div>
          </div>
        )}
        
        {economicImpact && (
          <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800 flex gap-4 items-start">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Economic Fallout</h3>
              <p className="text-gray-200">{economicImpact}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
