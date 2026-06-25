"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2 } from "lucide-react";

interface Issue {
  type: "error" | "warn" | "pass";
  msg: string;
  fix?: string; // what the optimizer will fix
}

interface Props {
  formData: any;
  onOptimized?: (optimized: any) => void; // callback to merge optimized fields into formData
}

export default function SEOScoringWidget({ formData, onOptimized }: Props) {
  const [score, setScore] = useState(100);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [justOptimized, setJustOptimized] = useState(false);

  useEffect(() => {
    const newIssues: Issue[] = [];
    let curScore = 100;

    const title = formData?.title || formData?.seo?.title || "";
    const desc = formData?.seo?.description || "";
    const content = formData?.content || formData?.summary || formData?.overview || "";
    const aiSummary = formData?.aiSummary || "";
    const keywords = formData?.seo?.keywords || [];
    const featuredImage = formData?.featuredImage || formData?.imageUrl || "";
    const slug = formData?.slug || "";

    // Title
    if (!title) {
      newIssues.push({ type: "error", msg: "Missing SEO title", fix: "seo.title" });
      curScore -= 25;
    } else if (title.length < 30 || title.length > 60) {
      newIssues.push({ type: "warn", msg: `Title: ${title.length} chars (want 30–60)`, fix: "seo.title" });
      curScore -= 10;
    } else {
      newIssues.push({ type: "pass", msg: "Title length is perfect" });
    }

    // Description
    if (!desc) {
      newIssues.push({ type: "error", msg: "Missing meta description", fix: "seo.description" });
      curScore -= 25;
    } else if (desc.length < 120 || desc.length > 160) {
      newIssues.push({ type: "warn", msg: `Description: ${desc.length} chars (want 120–160)`, fix: "seo.description" });
      curScore -= 10;
    } else {
      newIssues.push({ type: "pass", msg: "Description length is perfect" });
    }

    // Content
    const plainContent = content.replace(/<[^>]+>/g, "").trim();
    if (!plainContent || plainContent.length < 300) {
      newIssues.push({ type: "error", msg: `Content too thin (${plainContent.length} chars, need 300+)` });
      curScore -= 20;
    } else {
      newIssues.push({ type: "pass", msg: `Content: ${plainContent.length} chars ✓` });
    }

    // AI Summary
    if (!aiSummary) {
      newIssues.push({ type: "warn", msg: "Missing AI Summary (llms.txt)", fix: "aiSummary" });
      curScore -= 10;
    } else {
      newIssues.push({ type: "pass", msg: "AI Summary present" });
    }

    // Keywords
    if (!keywords || keywords.length === 0) {
      newIssues.push({ type: "warn", msg: "No keywords set", fix: "seo.keywords" });
      curScore -= 5;
    } else {
      newIssues.push({ type: "pass", msg: `${keywords.length} keywords set` });
    }

    // Featured image
    if (!featuredImage) {
      newIssues.push({ type: "warn", msg: "No featured image set" });
      curScore -= 5;
    }

    // Slug
    if (!slug) {
      newIssues.push({ type: "error", msg: "Missing slug", fix: "slug" });
      curScore -= 10;
    }

    setScore(Math.max(0, curScore));
    setIssues(newIssues);
  }, [formData]);

  const handleAutoOptimize = async () => {
    if (!onOptimized || isOptimizing) return;
    setIsOptimizing(true);
    setJustOptimized(false);
    try {
      const res = await fetch("/api/admin/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      let errorMsg = "Optimization failed";
      if (!res.ok) {
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      
      const { optimized } = await res.json();
      onOptimized(optimized);
      setJustOptimized(true);
      setTimeout(() => setJustOptimized(false), 4000);
    } catch (err: any) {
      alert("Auto-optimize failed: " + err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const scoreColor =
    score >= 95 ? "text-green-400" :
    score >= 70 ? "text-[var(--gold)]" :
    score >= 50 ? "text-orange-400" :
    "text-red-500";

  const scoreBg =
    score >= 95 ? "bg-green-500/10 border-green-500/20" :
    score >= 70 ? "bg-[var(--gold)]/10 border-[var(--gold)]/20" :
    score >= 50 ? "bg-orange-500/10 border-orange-500/20" :
    "bg-red-500/10 border-red-500/20";

  const needsOptimize = score < 95;
  const fixableIssues = issues.filter((i) => i.fix && i.type !== "pass");

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Score Header */}
      <div className={`p-4 border-b border-[var(--border)] ${scoreBg}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Live SEO Score</span>
          <span className={`text-2xl font-black tabular-nums ${scoreColor}`}>{score}<span className="text-sm font-normal text-[var(--muted)]">/100</span></span>
        </div>

        {/* Score Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 95 ? "bg-green-400" : score >= 70 ? "bg-[var(--gold)]" : score >= 50 ? "bg-orange-400" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
        {issues.map((issue, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            {issue.type === "error" && <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />}
            {issue.type === "warn" && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />}
            {issue.type === "pass" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />}
            <span className={
              issue.type === "pass" ? "text-green-500/70" :
              issue.type === "error" ? "text-red-400" :
              "text-[var(--muted)]"
            }>
              {issue.msg}
            </span>
          </div>
        ))}
      </div>

      {/* Auto-Optimize Button — only shows when score < 95 */}
      {needsOptimize && onOptimized && (
        <div className="p-3 pt-0">
          <button
            onClick={handleAutoOptimize}
            disabled={isOptimizing}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
              font-bold text-xs uppercase tracking-wider transition-all duration-200
              ${justOptimized
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isOptimizing
                ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 cursor-wait"
                : "bg-[var(--gold)] text-black hover:bg-yellow-400 shadow-[0_0_16px_rgba(212,175,55,0.3)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)]"
              }
            `}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Optimizing...
              </>
            ) : justOptimized ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimized!
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fix SEO ({fixableIssues.length} issues)
              </>
            )}
          </button>
          {!isOptimizing && !justOptimized && fixableIssues.length > 0 && (
            <p className="text-[9px] text-[var(--muted)] text-center mt-1.5 leading-tight">
              Will fix: {fixableIssues.map(i => i.fix).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Perfect score state */}
      {!needsOptimize && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-xs text-green-400 font-bold">SEO is fully optimized!</span>
          </div>
        </div>
      )}
    </div>
  );
}
