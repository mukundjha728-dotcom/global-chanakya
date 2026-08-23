import { 
  IntelligenceItem, AskChanakyaResponse, IndiaImpactResponse, ScenarioResponse, EntityIntelligence 
} from "./types";

export const MOCK_INTELLIGENCE_FEED: IntelligenceItem[] = [
  {
    id: "int-001",
    headline: "Iran-US Tensions Escalate in the Strait of Hormuz",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    region: "Middle East",
    topic: "Security",
    summary: "US naval forces have increased patrols following unconfirmed reports of Iranian fast-attack craft maneuvering aggressively near commercial shipping lanes.",
    whyItMatters: "The Strait of Hormuz is a critical chokepoint for global oil supplies. Any disruption immediately impacts global energy markets and supply chains.",
    indiaImpact: "HIGH",
    riskLevel: "HIGH",
    confidence: "HIGH",
    entities: [
      { id: "e-iran", name: "Iran", type: "Country", slug: "iran" },
      { id: "e-us", name: "United States", type: "Country", slug: "united-states" }
    ],
    sourceMetadata: {
      sources: [
        { name: "US Fifth Fleet", type: "Primary", publishedTime: new Date().toISOString(), retrievedTime: new Date().toISOString() }
      ],
      sourceCount: 3,
      freshness: "Updated 15 mins ago",
      methodology: "Triangulated satellite imagery and official defence press releases."
    }
  },
  {
    id: "int-002",
    headline: "China Expands Dual-Use Port Infrastructure in the Indian Ocean",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    region: "Indo-Pacific",
    topic: "Defence",
    summary: "New satellite imagery confirms the expansion of deep-water berths at a key Indian Ocean port, capable of accommodating PLA Navy vessels.",
    whyItMatters: "This development extends China's power projection capabilities further into the Indian Ocean Region (IOR), altering the maritime security calculus.",
    indiaImpact: "CRITICAL",
    riskLevel: "MODERATE",
    confidence: "VERY HIGH",
    entities: [
      { id: "e-china", name: "China", type: "Country", slug: "china" }
    ],
    sourceMetadata: {
      sources: [
        { name: "Satellite Intelligence", type: "Primary", publishedTime: new Date().toISOString(), retrievedTime: new Date().toISOString() }
      ],
      sourceCount: 2,
      freshness: "Updated 2 hours ago",
      methodology: "Geospatial analysis of commercial satellite imagery."
    }
  },
  {
    id: "int-003",
    headline: "EU Proposes New Tech Trade Restrictions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    region: "Europe",
    topic: "Trade",
    summary: "The European Commission has drafted a new framework to restrict the export of quantum computing and advanced semiconductor technologies.",
    whyItMatters: "This marks a significant step in the 'de-risking' strategy, potentially triggering retaliatory measures and accelerating supply chain bifurcation.",
    indiaImpact: "MEDIUM",
    riskLevel: "LOW",
    confidence: "HIGH",
    entities: [
      { id: "e-eu", name: "European Union", type: "Organization", slug: "european-union" }
    ],
    sourceMetadata: {
      sources: [
        { name: "EU Commission Draft", type: "Government", publishedTime: new Date().toISOString(), retrievedTime: new Date().toISOString() }
      ],
      sourceCount: 4,
      freshness: "Updated 5 hours ago",
      methodology: "Analysis of leaked draft policy documents and official statements."
    }
  }
];

export const MOCK_ASK_CHANAKYA_RESPONSE: AskChanakyaResponse = {
  query: "What would a prolonged Iran crisis mean for India?",
  timestamp: new Date().toISOString(),
  directAssessment: "A prolonged crisis involving Iran would severely challenge India's energy security, complicate its strategic investments in Chabahar port, and force a delicate diplomatic balancing act between Washington and Tehran.",
  strategicContext: "Iran occupies a crucial geostrategic position for India, serving as the primary gateway to Central Asia and Afghanistan via the Chabahar Port, bypassing Pakistan. The US-Iran adversarial relationship consistently places India in a position where it must balance its growing strategic partnership with the US against its regional connectivity and energy interests with Iran.",
  indiaImpact: "India faces asymmetric risks. While direct military threat is low, economic and strategic collateral damage would be high.",
  economicImpact: "Spikes in global crude oil prices would inflate India's import bill, widen the current account deficit, and increase domestic inflation. Although India has diversified its oil imports (notably from Russia), global price shocks remain a significant vulnerability.",
  securityImpact: "Instability in the Persian Gulf directly threatens the safety of the Indian diaspora (over 8 million in the Gulf) and the security of vital sea lines of communication (SLOCs) used for trade and energy shipments.",
  diplomaticImpact: "India would face immense pressure from Western partners to isolate Iran, while simultaneously needing to maintain ties to protect its investments (Chabahar) and its leverage in Central Asia.",
  regionalImpact: "A distracted Iran might reduce its influence in Afghanistan, potentially allowing extremist groups more operational space, which is detrimental to regional stability.",
  keyRisks: [
    "Energy price shocks disrupting macroeconomic stability.",
    "Derailment of the International North-South Transport Corridor (INSTC).",
    "Security threats to the Indian diaspora in the Gulf."
  ],
  scenarios: [
    "Low Escalation: Continuation of proxy conflicts with minimal direct disruption to shipping.",
    "Medium Escalation: Targeted strikes leading to temporary spikes in oil prices and localized shipping disruptions.",
    "High Escalation: Full closure of the Strait of Hormuz, triggering a global energy crisis and requiring mass evacuation of diaspora."
  ],
  whatToWatch: [
    "Movements of the US Fifth Fleet in the region.",
    "Statements regarding the operational status of Chabahar Port.",
    "OPEC+ production adjustment announcements."
  ],
  analystAssessment: "India must accelerate the operationalization of alternative supply chains and energy sources. The strategic utility of Chabahar remains high, but its vulnerability to US sanctions requires careful diplomatic navigation.",
  confidence: "HIGH",
  sources: [
    { name: "Global Chanakya Regional Analysis", type: "Analysis", publishedTime: new Date().toISOString(), retrievedTime: new Date().toISOString() }
  ]
};

export const MOCK_INDIA_IMPACT_RESPONSE: IndiaImpactResponse = {
  event: "Iran sanctions intensified",
  timestamp: new Date().toISOString(),
  overallImpact: "HIGH",
  dimensions: [
    { name: "Energy", level: "HIGH", description: "Potential spike in global crude prices affecting import bills." },
    { name: "Trade", level: "MEDIUM", description: "Disruption to bilateral trade mechanisms and payment routing." },
    { name: "Shipping", level: "HIGH", description: "Increased insurance premiums and risks in the Persian Gulf." },
    { name: "Defence", level: "MEDIUM", description: "Minimal direct impact, but regional instability requires readiness." },
    { name: "Diplomacy", level: "HIGH", description: "Pressure to comply with secondary sanctions vs. strategic autonomy." },
    { name: "Economy", level: "MEDIUM", description: "Inflationary pressures from energy costs." },
    { name: "Strategic Autonomy", level: "HIGH", description: "Testing India's ability to maintain independent foreign policy." },
    { name: "Regional Security", level: "HIGH", description: "Instability affecting the diaspora." }
  ],
  whyItMatters: "Intensified sanctions on Iran force India to recalibrate its regional connectivity projects (Chabahar) and navigate secondary sanctions, directly challenging its strategic autonomy.",
  immediateEffects: [
    "Immediate volatility in global oil markets.",
    "Increased scrutiny on Indian entities trading with Iran.",
    "Diplomatic demarches from Western capitals."
  ],
  mediumTermEffects: [
    "Delays in the expansion of Chabahar Port infrastructure.",
    "Shift in trade routes seeking sanction-proof mechanisms.",
    "Increased reliance on alternative energy suppliers."
  ],
  strategicOptions: [
    "Seek sanctions waivers for strategic projects (Chabahar).",
    "Establish alternative rupee-rial payment mechanisms.",
    "Accelerate diversification of energy imports."
  ],
  whatToWatch: [
    "US Treasury guidance on secondary sanctions.",
    "Iranian responses regarding the Strait of Hormuz.",
    "Status of the INSTC project."
  ],
  confidence: "HIGH"
};

export const MOCK_SCENARIO_RESPONSE: ScenarioResponse = {
  scenario: "What if the Strait of Hormuz closes?",
  timestamp: new Date().toISOString(),
  immediateImpact: "Immediate and severe shock to global energy markets. Approximately 20% of global oil consumption passes through the Strait.",
  timeline: [
    { timeframe: "0–30 DAYS", description: "Oil prices spike above $150/bbl. Panic buying in energy markets. Massive deployment of naval assets to the region. Global stock markets plunge." },
    { timeframe: "1–3 MONTHS", description: "Strategic Petroleum Reserves (SPR) drawn down globally. Severe inflationary pressures. Shipping routes rerouted, significantly increasing freight costs and transit times." },
    { timeframe: "3–6 MONTHS", description: "Global recession risks materialize. High probability of military intervention to reopen the strait. Accelerated shift towards alternative energy sources in importing nations." }
  ],
  indiaImpact: "CRITICAL",
  indiaImpactDetails: "India imports over 80% of its crude oil, a significant portion from the Middle East. A closure would immediately inflate the import bill, widen the current account deficit, and cause domestic fuel price spikes leading to inflation.",
  globalImpact: "Severe global economic contraction. Disruption to not just oil, but LNG shipments from Qatar, affecting global gas markets.",
  energyImpact: "Unprecedented price volatility. Reliance on SPRs and non-Gulf producers (US, Russia, West Africa) increases dramatically.",
  securityImpact: "High risk of regional war. The US and allies would likely initiate military operations to secure the strait.",
  diplomaticImpact: "Intense diplomatic pressure on regional actors to de-escalate. Emergency UN Security Council sessions.",
  strategicResponse: [
    "Immediate release of strategic petroleum reserves.",
    "Diplomatic outreach to Gulf nations to secure alternative supply routes.",
    "Naval deployment to protect Indian shipping in adjacent waters."
  ],
  outcomes: [
    "Military reopening of the strait within weeks, followed by a prolonged period of high tension.",
    "Long-term structural shift away from Middle Eastern oil dependency.",
    "Redrawing of regional security architectures."
  ],
  riskAssessment: "The probability of a full closure is LOW due to the devastating impact on all actors, including Iran. However, the impact is CRITICAL.",
  probability: "LOW"
};

export const MOCK_COUNTRY_INTELLIGENCE: EntityIntelligence = {
  entityId: "mock-india",
  entityType: "Country",
  lastUpdated: new Date().toISOString(),
  aiAssessment: "India is solidifying its position as a critical swing state in the multipolar global order. Its strategic focus remains on managing the border dispute with China, deepening the US partnership while maintaining strategic autonomy, and leading the Global South narrative.",
  currentRisks: [
    "Unresolved border tensions with China in the Himalayas.",
    "Vulnerability to global energy price shocks.",
    "Political instability in the immediate neighborhood (e.g., Bangladesh, Myanmar)."
  ],
  possibleScenarios: [
    "Escalation of border skirmishes requiring military mobilization.",
    "Significant supply chain relocation from China to India boosting manufacturing.",
    "Energy crisis forcing complex diplomatic balancing with sanctioned entities."
  ],
  strategicPosition: "Rising regional hegemon with growing global influence, acting as a bridge between the West and the Global South.",
  majorRelationships: [
    "United States (Strategic Partnership, Quad)",
    "Russia (Historical defense and energy ties)",
    "China (Adversarial, border disputes)"
  ],
  recentDevelopments: [
    "Deepening of defense technology transfer agreements with the US.",
    "Continued purchase of discounted Russian crude oil.",
    "Naval deployments in the Red Sea to protect commercial shipping."
  ],
  economicExposure: "Highly exposed to global energy prices; currently benefiting from 'China Plus One' supply chain diversification.",
  defenceConsiderations: "Modernizing forces to fight a potential two-front war (China/Pakistan). Focus on naval expansion in the Indian Ocean Region.",
  diplomaticPosition: "Multi-alignment. Active in Quad, SCO, BRICS, and G20.",
  strategicOpportunities: [
    "Positioning as a trusted node in global semiconductor and critical technology supply chains.",
    "Expanding defense exports to Southeast Asia and Africa."
  ]
};
