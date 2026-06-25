import React from "react";

export const metadata = {
  title: "Growth Dashboard | Admin",
};

export default function GrowthDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Growth Dashboard</h1>
          <p className="text-gray-400">Manage newsletters, trending, and announcements.</p>
        </div>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
        <p className="text-gray-500 italic">Module scaffolded and ready for implementation.</p>
      </div>
    </div>
  );
}
