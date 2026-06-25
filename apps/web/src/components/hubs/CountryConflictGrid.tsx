import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { IConflict } from "@/lib/models/Conflict";

interface CountryConflictGridProps {
  conflicts: (IConflict & { _id: string })[];
}

export function CountryConflictGrid({ conflicts }: CountryConflictGridProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
        Active & Past Conflicts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {conflicts.map((conflict) => (
          <Link 
            key={conflict._id} 
            href={`/conflict/${conflict.slug}`}
            className="block p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${(conflict.status as any) === 'Active' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                {conflict.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-2">{conflict.title}</h3>
            <p className="text-xs text-gray-400">Since {new Date(conflict.startDate).getFullYear()}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
