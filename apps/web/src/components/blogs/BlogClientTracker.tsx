"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

interface TrackerProps {
  title: string;
  category: string;
  author: string;
  slug: string;
  isLoggedIn: boolean;
}

export default function BlogClientTracker({
  title,
  category,
  author,
  slug,
  isLoggedIn,
}: TrackerProps) {
  const trackedInitial = useRef(false);
  const lastActivityTime = useRef(Date.now());
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const isIdle = useRef(false);
  
  const getDeviceType = () => {
    if (typeof window === "undefined") return "unknown";
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  useEffect(() => {
    if (!trackedInitial.current) {
      // Send Posthog event
      posthog.capture("article_read", { title, category, author });
      
      // Send initial view hit to backend
      fetch(`/api/blogs/${slug}/view`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPing: false })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.formattedViews) {
          const els = document.querySelectorAll('.blog-view-count');
          els.forEach(el => el.textContent = data.formattedViews);
        }
      })
      .catch(() => {});
      
      trackedInitial.current = true;
    }
  }, [title, category, author, slug]);

  // Setup idle detection
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleActivity = () => {
      lastActivityTime.current = Date.now();
      isIdle.current = false;
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(() => {
        isIdle.current = true;
      }, 30000); // 30 seconds idle
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    
    // Initial setup
    handleActivity();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [isLoggedIn]);

  // Setup periodic ping
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      // Don't ping if tab is hidden or user is idle
      if (document.hidden || isIdle.current) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressPercentage = scrollHeight > 0 
        ? Math.min(100, Math.round((window.scrollY / scrollHeight) * 100)) 
        : 100;

      fetch(`/api/blogs/${slug}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPing: true,
          progressPercentage,
          timeSpent: 15, // 15 seconds since last ping
          resumePoint: Math.round(window.scrollY),
          deviceType: getDeviceType()
        })
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [slug, isLoggedIn]);

  return null;
}
