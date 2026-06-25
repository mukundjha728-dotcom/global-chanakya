"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function SEOScoringWidget({ formData }: { formData: any }) {
  const [score, setScore] = useState(100);
  const [issues, setIssues] = useState<{ type: "error" | "warn" | "pass"; msg: string }[]>([]);

  useEffect(() => {
    const newIssues: { type: "error" | "warn" | "pass"; msg: string }[] = [];
    let curScore = 100;

    const title = formData?.title || formData?.seo?.title || "";
    const desc = formData?.seo?.description || "";
    const content = formData?.content || formData?.summary || "";
    const aiSummary = formData?.aiSummary || "";

    if (!title) {
      newIssues.push({ type: "error", msg: "Missing SEO Title" });
      curScore -= 30;
    } else if (title.length < 30 || title.length > 60) {
      newIssues.push({ type: "warn", msg: "Title should be 30-60 characters" });
      curScore -= 10;
    } else {
      newIssues.push({ type: "pass", msg: "Title length is optimal" });
    }

    if (!desc) {
      newIssues.push({ type: "error", msg: "Missing Meta Description" });
      curScore -= 30;
    } else if (desc.length < 120 || desc.length > 160) {
      newIssues.push({ type: "warn", msg: "Description should be 120-160 characters" });
      curScore -= 10;
    } else {
      newIssues.push({ type: "pass", msg: "Description length is optimal" });
    }

    if (!content || content.length < 300) {
      newIssues.push({ type: "error", msg: "Content is too thin (< 300 chars)" });
      curScore -= 20;
    }

    if (!aiSummary) {
      newIssues.push({ type: "warn", msg: "Missing AI Summary (llms.txt) for semantic ingestion" });
      curScore -= 15;
    }

    setScore(Math.max(0, curScore));
    setIssues(newIssues);
  }, [formData]);

  const scoreColor = score > 80 ? "text-green-500" : score > 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Live SEO Score</h3>
        <span className={`text-2xl font-black ${scoreColor}`}>{score}/100</span>
      </div>
      <div className="space-y-2">
        {issues.map((issue, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            {issue.type === "error" && <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
            {issue.type === "warn" && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
            {issue.type === "pass" && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
            <span className={issue.type === "pass" ? "text-green-500/80" : "text-[var(--muted)]"}>{issue.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
