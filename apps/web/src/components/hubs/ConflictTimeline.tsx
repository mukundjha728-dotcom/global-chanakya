import React from "react";

interface TimelineEvent {
  _id: string;
  title: string;
  date: string;
  description: string;
}

interface ConflictTimelineProps {
  events: TimelineEvent[];
}

export function ConflictTimeline({ events }: ConflictTimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
        Event Timeline
      </h2>
      <div className="relative border-l-2 border-gray-800 ml-3 space-y-8">
        {events.map((event) => (
          <div key={event._id} className="relative pl-6">
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-gray-950"></div>
            <time className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 block">
              {new Date(event.date).toLocaleDateString()}
            </time>
            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
