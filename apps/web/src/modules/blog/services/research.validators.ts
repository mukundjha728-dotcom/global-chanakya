export const TopicDiscoveryJsonSchema = {
  type: "object",
  properties: {
    candidateTopics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          topic: { type: "string", description: "The detailed specific subject matter" },
          reportType: { type: "string", enum: ["Intelligence", "Analysis", "Briefing"] },
          researchRationale: { type: "string", description: "Why this specific topic is highly relevant and requires deeper research today." }
        },
        required: ["title", "topic", "reportType", "researchRationale"],
        additionalProperties: false
      }
    }
  },
  required: ["candidateTopics"],
  additionalProperties: false
};

export const FactExtractionJsonSchema = {
  type: "object",
  properties: {
    verifiedFacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string", description: "The specific factual claim extracted from the source." },
          status: { type: "string", enum: ["FACT", "CONFIRMED", "REPORTED", "DISPUTED"], description: "The verification status of the claim." },
          sourceUrls: { type: "array", items: { type: "string" }, description: "URLs of the sources supporting this claim." },
          sourceType: { type: "string", enum: ["PRIMARY", "SECONDARY", "ANALYTICAL", "UNKNOWN"], description: "Type of the source." },
          supportingEvidence: { type: "string", description: "Brief quote or evidence supporting the claim." }
        },
        required: ["claim", "status", "sourceUrls", "sourceType", "supportingEvidence"],
        additionalProperties: false
      }
    },
    disputedClaims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string" },
          natureOfDispute: { type: "string" },
          sourceUrls: { type: "array", items: { type: "string" } }
        },
        required: ["claim", "natureOfDispute", "sourceUrls"],
        additionalProperties: false
      }
    }
  },
  required: ["verifiedFacts", "disputedClaims"],
  additionalProperties: false
};

export const StrategicDriversActorAnalysisSchema = {
  type: "object",
  properties: {
    strategicSignificance: { type: "string" },
    historicalContinuity: { type: "string" },
    powerCenterAnalysis: { type: "string" },
    hiddenDrivers: { type: "string" }
  },
  required: ["strategicSignificance", "historicalContinuity", "powerCenterAnalysis", "hiddenDrivers"],
  additionalProperties: false
};

export const OrderEffectsSchema = {
  type: "object",
  properties: {
    secondOrderEffects: { type: "string" },
    thirdOrderEffects: { type: "string" }
  },
  required: ["secondOrderEffects", "thirdOrderEffects"],
  additionalProperties: false
};

export const RegionalImplicationsSchema = {
  type: "object",
  properties: {
    indiaImplications: { type: "string" },
    globalSouthImplications: { type: "string" }
  },
  required: ["indiaImplications", "globalSouthImplications"],
  additionalProperties: false
};

export const StrategicThesisSchema = {
  type: "object",
  properties: {
    strategicThesis: { type: "string", description: "A single powerful sentence summarizing the ultimate strategic judgment." }
  },
  required: ["strategicThesis"],
  additionalProperties: false
};

export const ScenarioAnalysisSchema = {
  type: "object",
  properties: {
    baseCase: { type: "string", description: "Most likely outcome." },
    bullCase: { type: "string", description: "Best-case outcome for stability." },
    bearCase: { type: "string", description: "Worst-case outcome/escalation." },
    qualitativeLikelihood: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }
  },
  required: ["baseCase", "bullCase", "bearCase", "qualitativeLikelihood"],
  additionalProperties: false
};

export const IntelligenceForecastSchema = {
  type: "object",
  properties: {
    sixMonthForecast: { type: "string" },
    twentyFourMonthForecast: { type: "string" },
    indicatorsToMonitor: { 
      type: "array", 
      items: { type: "string" },
      description: "List of specific observable events that would signal the forecast is unfolding."
    }
  },
  required: ["sixMonthForecast", "twentyFourMonthForecast", "indicatorsToMonitor"],
  additionalProperties: false
};

export const ArticleOutlineSchema = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sectionId: { type: "string", description: "Unique ID for the section, e.g., 'exec_summary', 'power_center_analysis'" },
          headerText: { type: "string", description: "The HTML H2 header text for this section." },
          targetWordCount: { type: "number", description: "Word count budget to ensure the total reaches >5000 words. Should average 350-500 words per section." },
          focusTopics: { type: "array", items: { type: "string" }, description: "Topics to cover in this specific section." }
        },
        required: ["sectionId", "headerText", "targetWordCount", "focusTopics"],
        additionalProperties: false
      }
    }
  },
  required: ["sections"],
  additionalProperties: false
};

export const ArticleSectionSchema = {
  type: "object",
  properties: {
    htmlContent: { type: "string", description: "The fully formed HTML for this section, including the <h2> tag. CRITICAL: Do NOT use any double quotes (\") inside HTML tags or attributes to prevent JSON parsing errors. Use single quotes for attributes if necessary, or omit attributes entirely." },
    wordCount: { type: "number", description: "Approximate word count generated." }
  },
  required: ["htmlContent", "wordCount"],
  additionalProperties: false
};

export const SEOMetadataSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "The H1 article title." },
    slug: { type: "string", description: "The URL slug." },
    excerpt: { type: "string", description: "A brief summary for the blog listing page." },
    focusKeyword: { type: "string", description: "Primary SEO keyword." },
    metaTitle: { type: "string", description: "Meta title, strictly <= 60 characters." },
    metaDescription: { type: "string", description: "Meta description, strictly <= 160 characters." },
    keywords: { type: "array", items: { type: "string" }, description: "Strictly 15-20 SEO keywords." },
    aiSummary: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    imageSearchQuery: { type: "string", description: "Specific 1-3 word query containing exact entities for Wikipedia image search." },
    linkedCountries: { type: "array", items: { type: "string" } },
    linkedLeaders: { type: "array", items: { type: "string" } },
    linkedConflicts: { type: "array", items: { type: "string" } }
  },
  required: [
    "title", "slug", "excerpt", "focusKeyword", "metaTitle", "metaDescription", 
    "keywords", "aiSummary", "tags", "imageSearchQuery", 
    "linkedCountries", "linkedLeaders", "linkedConflicts"
  ],
  additionalProperties: false
};
