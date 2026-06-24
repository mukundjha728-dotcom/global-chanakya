import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Globe, User, ShieldAlert, Users } from "lucide-react";

export type EntityType = "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";

interface EntityRelationCardProps {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  imageUrl?: string;
  subtitle?: string;
  isActive?: boolean;
}

const getEntityIcon = (type: EntityType) => {
  switch (type) {
    case "Country": return <Globe className="w-5 h-5 text-blue-400" />;
    case "Leader": return <User className="w-5 h-5 text-emerald-400" />;
    case "Conflict": return <ShieldAlert className="w-5 h-5 text-red-400" />;
    case "Alliance": return <Users className="w-5 h-5 text-purple-400" />;
    default: return <ArrowRight className="w-5 h-5 text-gray-400" />;
  }
};

const getEntityUrl = (type: EntityType, slug: string) => {
  switch (type) {
    case "Country": return `/country/${slug}`;
    case "Leader": return `/leader/${slug}`;
    case "Conflict": return `/conflict/${slug}`;
    case "Alliance": return `/alliance/${slug}`;
    case "Blog": return `/blogs/${slug}`;
    default: return `/`;
  }
};

export function EntityRelationCard({ type, name, slug, imageUrl, subtitle, isActive }: EntityRelationCardProps) {
  const url = getEntityUrl(type, slug);

  return (
    <Link href={url} className={`group flex flex-col items-center p-4 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-md transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/80 ${isActive ? 'ring-2 ring-blue-500/50 border-blue-500/30' : ''}`} aria-label={`${type}: ${name}`}>
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            fill
            sizes="64px"
            className="object-cover" 
            loading="lazy" 
          />
        ) : (
          getEntityIcon(type)
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-100 text-center line-clamp-1">{name}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1 text-center line-clamp-1">{subtitle}</p>}
      
      {/* AI Semantic metadata hidden visually but readable by bots */}
      <span className="sr-only" itemProp="about" itemType={`https://schema.org/${type === "Leader" ? "Person" : type === "Country" ? "Country" : "Event"}`}>
        <span itemProp="name">{name}</span>
        <span itemProp="url">{url}</span>
      </span>
    </Link>
  );
}
