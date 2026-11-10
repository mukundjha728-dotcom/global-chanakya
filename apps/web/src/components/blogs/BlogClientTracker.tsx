"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSession } from "next-auth/react";

interface TrackerProps {
  title: string;
  category: string;
  author: string;
  slug: string;
  isLoggedIn?: boolean;
}

export default function BlogClientTracker({
  title,
  category,
  author,
  slug,
  isLoggedIn: initialIsLoggedIn,
}: TrackerProps) {
  const { data: session } = useSession();
  const isLoggedIn = initialIsLoggedIn ?? !!session?.user;

  const trackedInitial = useRef(false);
  const lastActivityTime = useRef(Date.now());
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const isIdle = useRef(false);
  const lastPingTime = useRef(Date.now());
  const lastProgress = useRef(0);
  
  const getDeviceType = () => {
    if (typeof window === "undefined") return "unknown";
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  const calculateProgress = () => {
    if (typeof window === "undefined") return 0;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return scrollHeight > 0 
      ? Math.min(100, Math.round((window.scrollY / scrollHeight) * 100)) 
      : 100;
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
      }, 45000); // 45 seconds idle
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    
    handleActivity();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [isLoggedIn]);

  // Setup periodic ping (throttled to 60s) and send on page leave
  useEffect(() => {
    if (!isLoggedIn) return;

    const sendProgressPing = (keepalive = false) => {
      const now = Date.now();
      const timeSpent = Math.max(1, Math.round((now - lastPingTime.current) / 1000));
      const progressPercentage = calculateProgress();
      lastPingTime.current = now;
      lastProgress.current = progressPercentage;

      const payload = JSON.stringify({
        isPing: true,
        progressPercentage,
        timeSpent,
        resumePoint: typeof window !== "undefined" ? Math.round(window.scrollY) : 0,
        deviceType: getDeviceType()
      });

      try {
        fetch(`/api/blogs/${slug}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive
        }).catch(() => {});
      } catch (err) {
        // Ignore network errors on unload
      }
    };

    // Periodic ping every 60s instead of 15s to save CPU
    const interval = setInterval(() => {
      if (document.hidden || isIdle.current) return;
      sendProgressPing(false);
    }, 60000);

    // Save progress on tab change / exit
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendProgressPing(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sendProgressPing(true);
    };
  }, [slug, isLoggedIn]);

  return null;
}
