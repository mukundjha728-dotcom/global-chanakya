import React from "react";
import Image from "next/image";
import { EntityGraph, GraphNode, GraphEdge } from "../graph/EntityGraph";
import { LeaderInfluenceMap } from "./LeaderInfluenceMap";
import { Globe, Users, BookOpen } from "lucide-react";

interface LeaderHubProps {
  leader: any; // ILeader type from models
  associatedNodes?: GraphNode[];
  edges?: GraphEdge[];
}

export function LeaderHub({ leader, associatedNodes = [], edges = [] }: LeaderHubProps) {
  const nodes: GraphNode[] = [
    { id: leader._id as string, type: "Leader", name: leader.name, slug: leader.slug, imageUrl: leader.imageUrl },
    ...associatedNodes,
  ];

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-gray-800 pb-8">
        {leader.imageUrl ? (
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl border-4 border-gray-800 overflow-hidden shrink-0">
            <Image 
              src={leader.imageUrl} 
              alt={leader.name} 
              fill
              sizes="(max-width: 768px) 128px, 192px"
              className="object-cover"
              priority 
            />
          </div>
        ) : (
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
            <Users className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{leader.name}</h1>
          <p className="text-xl text-emerald-400 font-bold mb-4">{leader.role} of {leader.country}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> Political Stance: {leader.politicalStance || "N/A"}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Since: {leader.tookOffice ? new Date(leader.tookOffice).getFullYear() : "N/A"}</span>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Biography & Strategic Profile</h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" itemProp="description">
            <p>{leader.bio}</p>
          </div>
          
          {leader.policyPositions && leader.policyPositions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-white">Key Policy Positions</h3>
              <ul className="space-y-3">
                {leader.policyPositions.map((pos: any, idx: number) => (
                  <li key={idx} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                    <strong className="text-emerald-400 block mb-1">{pos.topic}</strong>
                    <span className="text-gray-300">{pos.stance}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        
        <aside>
          <LeaderInfluenceMap leader={leader} />
        </aside>
      </div>

      {/* Entity Graph */}
      {nodes.length > 1 && (
        <div className="mb-12">
          <EntityGraph nodes={nodes} edges={edges} title="Network of Influence" />
        </div>
      )}

      {/* AI Semantic Block */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": leader.name,
        "jobTitle": leader.role,
        "description": leader.bio,
        "worksFor": {
          "@type": "Country",
          "name": leader.country
        }
      })}} />
    </article>
  );
}
