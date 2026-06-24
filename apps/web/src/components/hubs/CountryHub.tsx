import React from "react";
import Image from "next/image";
import { ICountry } from "@/lib/models/Country";
import { CountryTimeline } from "./CountryTimeline";
import { CountryConflictGrid } from "./CountryConflictGrid";
import { EntityGraph, GraphNode, GraphEdge } from "../graph/EntityGraph";

interface CountryHubProps {
  country: ICountry;
  leaderNodes?: GraphNode[];
  conflictNodes?: GraphNode[];
  edges?: GraphEdge[];
}

export function CountryHub({ country, leaderNodes = [], conflictNodes = [], edges = [] }: CountryHubProps) {
  // Combine nodes for graph
  const nodes: GraphNode[] = [
    { id: country._id as string, type: "Country", name: country.name, slug: country.slug, imageUrl: country.flagUrl },
    ...leaderNodes,
    ...conflictNodes,
  ];

  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 border-b border-gray-800 pb-8 flex items-center gap-6">
        {country.flagUrl && (
          <div className="relative w-24 h-16 rounded shadow-lg border border-gray-700 overflow-hidden shrink-0">
            <Image 
              src={country.flagUrl} 
              alt={`${country.name} flag`} 
              fill
              sizes="96px"
              className="object-cover" 
              loading="eager"
              priority
            />
          </div>
        )}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{country.name}</h1>
          <p className="text-lg text-gray-400 font-medium">
            {country.geopoliticalStatus} · Region: {country.region} · Capital: {country.capital}
          </p>
        </div>
      </header>

      {/* Overview & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Strategic Overview</h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed" itemProp="description">
            <p>{country.overview}</p>
          </div>
        </section>
        
        <aside className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 text-white">Vital Indicators</h3>
          <ul className="space-y-4 text-gray-300">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-500">Population</span>
              <span className="font-semibold">{country.population.toLocaleString()}</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-500">GDP</span>
              <span className="font-semibold">{country.gdp || 'N/A'}</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-500">Intel Score</span>
              <span className="font-semibold text-blue-400">{country.intelligenceScore}/100</span>
            </li>
            {country.alliances && country.alliances.length > 0 && (
              <li className="flex flex-col pt-2">
                <span className="text-gray-500 mb-2">Major Alliances</span>
                <div className="flex flex-wrap gap-2">
                  {country.alliances.map(a => (
                    <span key={a} className="px-2 py-1 bg-gray-800 text-xs rounded-md text-gray-300 border border-gray-700">{a}</span>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </aside>
      </div>

      {/* Entity Graph Connection */}
      {nodes.length > 1 && (
        <div className="mb-12">
          <EntityGraph nodes={nodes} edges={edges} title="Strategic Relationships" />
        </div>
      )}

      {/* Conflicts & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CountryConflictGrid conflicts={country.relatedConflicts as any || []} />
        <CountryTimeline events={country.timelineReferences as any || []} />
      </div>

      {/* Semantic Schema block */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Country",
        "name": country.name,
        "description": country.overview,
        "containedInPlace": { "@type": "Continent", "name": country.region }
      })}} />
    </article>
  );
}
