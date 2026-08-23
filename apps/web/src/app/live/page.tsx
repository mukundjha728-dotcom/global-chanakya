"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Clock, AlertTriangle, TrendingUp, Filter, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveIntelligencePage() {
  const [filter, setFilter] = useState({ category: "", eventType: "", sort: "recent" });
  const [skip, setSkip] = useState(0);

  const queryParams = new URLSearchParams({
    limit: "20",
    skip: skip.toString(),
    ...(filter.category && { category: filter.category }),
    ...(filter.eventType && { eventType: filter.eventType }),
    ...(filter.sort && { sort: filter.sort })
  });

  const { data, error, isLoading, mutate } = useSWR(`/api/intelligence/timeline?${queryParams}`, fetcher, {
    refreshInterval: 60000, // Poll every minute
  });

  const events = data?.data || [];
  const hasMore = data?.pagination?.hasMore || false;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Intelligence Live</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Real-time geopolitical events and breaking news.
            </p>
          </div>
          <button 
            onClick={() => mutate()} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-wrap gap-4 items-center">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            className="border rounded px-3 py-1"
            value={filter.eventType}
            onChange={(e) => setFilter(f => ({ ...f, eventType: e.target.value, sort: e.target.value === 'BREAKING' ? 'recent' : f.sort }))}
          >
            <option value="">All Event Types</option>
            <option value="BREAKING">Breaking News</option>
            <option value="CONFLICT">Conflict</option>
            <option value="DIPLOMACY">Diplomacy</option>
            <option value="ANALYSIS">Analysis</option>
          </select>
          <select 
            className="border rounded px-3 py-1"
            value={filter.sort}
            onChange={(e) => setFilter(f => ({ ...f, sort: e.target.value }))}
          >
            <option value="recent">Most Recent</option>
            <option value="important">Highest Importance</option>
          </select>
        </div>

        <div className="space-y-6">
          {isLoading && events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Loading live intelligence...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No live events found for these filters.</div>
          ) : (
            events.map((event: any) => (
              <article key={event._id.toString()} className={`bg-white rounded-lg shadow p-6 border-l-4 ${event.eventType === 'BREAKING' ? 'border-red-600' : 'border-blue-600'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {event.eventType === "BREAKING" && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Breaking
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase font-bold">{event.category}</span>
                    <span className={`text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1 ${event.importance >= 70 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                      <TrendingUp className="w-3 h-3" />
                      Importance: {event.importance}/100
                    </span>
                  </div>
                  <div className="text-right">
                    <time className="text-sm text-gray-500 font-mono block">
                      {new Date(event.publishedAt).toLocaleString()}
                    </time>
                    <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">
                      {(Date.now() - new Date(event.publishedAt).getTime()) < 86400000 ? 'Fresh' : ''}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{event.summary}</p>
                <div className="text-sm text-gray-500 flex items-center gap-4 border-t pt-4">
                  <span>Sources: <strong className="text-gray-700">{event.sourceNames.join(", ")}</strong></span>
                  <a href={event.sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Read Original &rarr;</a>
                </div>
              </article>
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setSkip(s => s + 20)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-medium"
            >
              Load Older Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
