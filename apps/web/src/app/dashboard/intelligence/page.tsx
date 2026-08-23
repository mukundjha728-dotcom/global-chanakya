"use client";
import { useState } from "react";

export default function AdminLiveIntelligencePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerRefresh = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/internal/intelligence/refresh", {
        method: "POST",
        headers: {
          "Authorization": "Bearer dev-secret"
        }
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Live Intelligence Ingestion Panel</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Manual Ingestion Trigger</h2>
        <p className="text-gray-600 mb-6">
          Trigger a synchronous poll of all registered RSS providers. The ingestion service will fetch, normalize, deduplicate, embed, and store new live events.
        </p>
        <button 
          onClick={triggerRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Polling Providers..." : "Trigger Live Ingestion"}
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto shadow-inner">
          <pre className="font-mono text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
