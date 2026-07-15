"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  layout?: string;
  layoutKey?: string;
}

/**
 * Google AdSense Ad Unit Component
 * Renders a single AdSense ad unit. Requires the AdSense script to be loaded in <head>.
 * 
 * Usage:
 *   <AdUnit slot="1234567890" format="auto" responsive />
 *   <AdUnit slot="1234567890" format="fluid" layout="in-article" layoutKey="-fb+5w+4e-db+86" />
 */
export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style,
  layout,
  layoutKey,
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      // AdSense not loaded yet or ad blocker active
    }
  }, []);

  return (
    <div ref={adRef} className={`ad-container ${className}`} style={{ textAlign: "center", overflow: "hidden", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...(style || {}) }}
        data-ad-client="ca-pub-3046817657353243"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(responsive ? { "data-full-width-responsive": "true" } : {})}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}

/**
 * In-Article Ad — designed to sit between paragraphs of content.
 * Uses the "fluid" format with "in-article" layout for native look.
 */
export function InArticleAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <AdUnit
      slot={slot}
      format="fluid"
      layout="in-article"
      layoutKey="-fb+5w+4e-db+86"
      className={`my-8 ${className}`}
    />
  );
}

/**
 * Sidebar Ad — designed for sticky sidebar placement.
 * Uses rectangle format.
 */
export function SidebarAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <AdUnit
      slot={slot}
      format="rectangle"
      responsive={false}
      className={`mb-6 ${className}`}
      style={{ minHeight: 250 }}
    />
  );
}

/**
 * Banner Ad — full-width horizontal ad for top/bottom of pages.
 */
export function BannerAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <AdUnit
      slot={slot}
      format="horizontal"
      responsive
      className={`my-6 ${className}`}
      style={{ minHeight: 90 }}
    />
  );
}
