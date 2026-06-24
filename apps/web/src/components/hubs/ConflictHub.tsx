import React from "react";
import { IConflict } from "@/lib/models/Conflict";
import { ConflictTimeline } from "./ConflictTimeline";
import { ConflictImpact } from "./ConflictImpact";
import { EntityGraph, GraphNode, GraphEdge } from "../graph/EntityGraph";
import Link from "next/link";
import { Globe } from "lucide-react";

interface ConflictHubProps {
  conflict: IConflict;
  countryNodes?: GraphNode[];
  edges?: GraphEdge[];
}

export function ConflictHub({ conflict, countryNodes = [], edges = [] }: ConflictHubProps) {
  // Combine nodes for graph
  const nodes: GraphNode[] = [
    { id: conflict._id as string, type: "Conflict", name: conflict.title, slug: conflict.slug },
    ...countryNodes,
  ];

  const isActive = conflict.status === "Active" || conflict.status === "Escalating";

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide rounded-full border ${isActive ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-gray-800 text-gray-300 border-gray-600'}`}>
            {conflict.status}
          </span>
          {conflict.tags && conflict.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-900 text-gray-400 rounded-md border border-gray-800">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{conflict.title}</h1>
        <p className="text-lg text-gray-400 font-medium flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          {conflict.regions.join(" • ")}
        </p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Strategic Overview</h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" itemProp="description">
            <p>{conflict.overview}</p>
          </div>
        </section>
        
        <aside className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-4 text-white">Involved Nations</h3>
            <ul className="space-y-3">
              {conflict.involvedParties?.map((party, idx) => {
                const c = party.countryId as any; // Populated country doc
                if (!c || !c.name) return null;
                return (
                  <li key={idx} className="flex items-center justify-between">
                    <Link href={`/country/${c.slug}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                      {c.flagUrl && <img src={c.flagUrl} alt="" className="w-6 h-4 object-cover rounded" />}
                      <span className="font-semibold">{c.name}</span>
                    </Link>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{party.role}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-4 text-white">Timeline</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Started</span>
                <span className="font-semibold">{new Date(conflict.startDate).toLocaleDateString()}</span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold">
                  {conflict.endDate ? 'Concluded' : `${new Date().getFullYear() - new Date(conflict.startDate).getFullYear()} Years`}
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Entity Graph */}
      {nodes.length > 1 && (
        <div className="mb-12">
          <EntityGraph nodes={nodes} edges={edges} title="Conflict Entity Map" layout="grid" />
        </div>
      )}

      {/* Impact & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ConflictImpact economicImpact={conflict.economicImpact} casualties={conflict.casualties} />
        <ConflictTimeline events={conflict.timelineReferences as any || []} />
      </div>

      {/* AI Semantic Block */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": conflict.title,
        "description": conflict.overview,
        "startDate": conflict.startDate,
        "endDate": conflict.endDate,
        "eventStatus": conflict.status === "Active" ? "https://schema.org/EventRescheduled" : "https://schema.org/EventScheduled"
      })}} />
    </article>
  );
}
