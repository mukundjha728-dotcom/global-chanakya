export interface SourceTrustMetadata {
  domain: string;
  reliabilityTier: 1 | 2 | 3 | 4 | 5; // 1 = Highest (Official/Gov), 5 = Lowest (Unverified)
  defaultCategory: string;
  pollingEnabled: boolean;
  parserVersion: string;
}

export const SOURCE_TRUST_MAP: Record<string, SourceTrustMetadata> = {
  "bbc.com": {
    domain: "bbc.com",
    reliabilityTier: 2,
    defaultCategory: "Geopolitics",
    pollingEnabled: true,
    parserVersion: "v1.0"
  },
  "reuters.com": {
    domain: "reuters.com",
    reliabilityTier: 1,
    defaultCategory: "Geopolitics",
    pollingEnabled: true,
    parserVersion: "v1.0"
  },
  "apnews.com": {
    domain: "apnews.com",
    reliabilityTier: 1,
    defaultCategory: "Geopolitics",
    pollingEnabled: true,
    parserVersion: "v1.0"
  },
  "aljazeera.com": {
    domain: "aljazeera.com",
    reliabilityTier: 2,
    defaultCategory: "Geopolitics",
    pollingEnabled: true,
    parserVersion: "v1.0"
  },
  "un.org": {
    domain: "un.org",
    reliabilityTier: 1,
    defaultCategory: "Diplomacy",
    pollingEnabled: true,
    parserVersion: "v1.0"
  }
};

export function getTrustMetadata(sourceName: string): SourceTrustMetadata {
  const normalized = sourceName.toLowerCase();
  
  // Try exact match
  if (SOURCE_TRUST_MAP[normalized]) {
    return SOURCE_TRUST_MAP[normalized];
  }

  // Substring match
  for (const [key, value] of Object.entries(SOURCE_TRUST_MAP)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Fallback default
  return {
    domain: "unknown",
    reliabilityTier: 3,
    defaultCategory: "World",
    pollingEnabled: false,
    parserVersion: "v1.0"
  };
}
