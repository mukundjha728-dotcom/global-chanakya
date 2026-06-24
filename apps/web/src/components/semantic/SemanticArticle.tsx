import React from "react";
import { SummaryBlock } from "./SummaryBlock";
import { RiskBlock } from "./RiskBlock";
import { FutureOutlook } from "./FutureOutlook";
import { CitationBlock } from "../citations/CitationBlock";
import { DefinitionBlock } from "./DefinitionBlock";
import { autoLinkEntities } from "@/lib/linkingEngine";

interface SemanticArticleProps {
  contentHtml: string;
  aiSummary: string;
  keyInsights: string[];
  riskAssessment?: { level: any; description: string };
  futureOutlook?: { overview: string; scenarios: string[] };
  citations?: any[];
  definitions?: { term: string; definition: string }[];
}

export function SemanticArticle({ 
  contentHtml, 
  aiSummary, 
  keyInsights, 
  riskAssessment, 
  futureOutlook, 
  citations,
  definitions 
}: SemanticArticleProps) {

  // Auto-link entities inside the raw HTML
  const linkedHtml = autoLinkEntities(contentHtml);

  return (
    <article itemScope itemType="https://schema.org/AnalysisNewsArticle" className="max-w-3xl mx-auto">
      {/* 1. Executive Summary & Key Insights */}
      <SummaryBlock executiveSummary={aiSummary} keyInsights={keyInsights} />
      
      {/* 2. Geopolitical Definitions (if applicable near top) */}
      {definitions && definitions.map((def, idx) => (
        <DefinitionBlock key={idx} term={def.term} definition={def.definition} />
      ))}

      {/* 3. Core Article Content */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none my-8"
        itemProp="articleBody"
        dangerouslySetInnerHTML={{ __html: linkedHtml }}
      />

      {/* 4. Risk Assessment */}
      {riskAssessment && (
        <RiskBlock level={riskAssessment.level} assessment={riskAssessment.description} />
      )}

      {/* 5. Future Outlook */}
      {futureOutlook && (
        <FutureOutlook outlook={futureOutlook.overview} scenarios={futureOutlook.scenarios} />
      )}

      {/* 6. Source Layer / Citation Engine */}
      {citations && citations.length > 0 && (
        <CitationBlock citations={citations} />
      )}
    </article>
  );
}
