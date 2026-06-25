"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export default function BlogClientTracker({
  title,
  category,
  author,
}: {
  title: string;
  category: string;
  author: string;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      posthog.capture("article_read", {
        title,
        category,
        author,
      });
      tracked.current = true;
    }
  }, [title, category, author]);

  return null;
}
