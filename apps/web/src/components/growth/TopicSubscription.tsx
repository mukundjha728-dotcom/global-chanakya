"use client";

import React, { useState } from "react";
import { Bell, BellRing } from "lucide-react";

interface TopicSubscriptionProps {
  topicId: string;
  topicName: string;
  type: "Country" | "Leader" | "Conflict" | "Alliance";
  initialSubscribed?: boolean;
}

export function TopicSubscription({ topicId, topicName, type, initialSubscribed = false }: TopicSubscriptionProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);

  const toggleSubscription = async () => {
    // Optimistic UI update
    setIsSubscribed(!isSubscribed);
    // Real implementation would hit /api/user/watchlist
  };

  return (
    <button 
      onClick={toggleSubscription}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
        isSubscribed 
          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 group' 
          : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
      }`}
      aria-label={`${isSubscribed ? 'Unfollow' : 'Follow'} ${topicName}`}
    >
      {isSubscribed ? (
        <>
          <BellRing className="w-4 h-4 group-hover:hidden" />
          <Bell className="w-4 h-4 hidden group-hover:block" />
          <span className="group-hover:hidden">Following {type}</span>
          <span className="hidden group-hover:block">Unfollow</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Follow {type}
        </>
      )}
    </button>
  );
}
