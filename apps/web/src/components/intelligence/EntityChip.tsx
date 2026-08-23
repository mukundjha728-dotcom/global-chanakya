import React from 'react';
import Link from 'next/link';
import { EntityReference } from '@/lib/intelligence/types';
import { Map, User, Swords } from 'lucide-react';

const typeConfig = {
  Country: { icon: Map, color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  Leader: { icon: User, color: "text-purple-400 border-purple-400/30 bg-purple-400/10" },
  Conflict: { icon: Swords, color: "text-red-400 border-red-400/30 bg-red-400/10" },
  Organization: { icon: Map, color: "text-teal-400 border-teal-400/30 bg-teal-400/10" },
};

export function EntityChip({ entity }: { entity: EntityReference }) {
  const config = typeConfig[entity.type] || typeConfig.Country;
  const Icon = config.icon;
  
  // Construct URL based on type
  let href = "#";
  switch(entity.type) {
    case "Country": href = `/countries/${entity.slug}`; break;
    case "Leader": href = `/leaders/${entity.slug}`; break;
    case "Conflict": href = `/conflicts/${entity.slug}`; break;
  }

  return (
    <Link 
      href={href}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${config.color} text-[10px] font-bold uppercase tracking-[0.1em] hover:brightness-125 transition-all`}
    >
      <Icon className="w-3 h-3" />
      {entity.name}
    </Link>
  );
}
