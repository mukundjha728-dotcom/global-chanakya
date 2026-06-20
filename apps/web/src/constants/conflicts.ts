export interface Conflict {
  id: string;
  slug: string;
  title: string;
  region: string;
  threatLevel: "High Risk" | "Escalating" | "Stable" | "Critical";
  updatedAt: string;
  summary: string;
  category: string;
  escalationScore: number;
  image: string;
  source: string;
}

export const CONFLICTS_DATA: Conflict[] = [
  {
    id: "c-1",
    slug: "south-china-sea-escalation",
    title: "South China Sea: Naval Standoff Escalates Near Disputed Shoal",
    region: "Indo-Pacific",
    threatLevel: "Critical",
    updatedAt: "2h ago",
    summary: "Recent maneuvers by maritime militia vessels have triggered diplomatic protests. Defense forces are on heightened alert as tracking systems show increased naval concentration.",
    category: "Naval Deployment",
    escalationScore: 8.5,
    image: "/images/fallback-geopolitics.jpg",
    source: "Defense Ministry Intel",
  },
  {
    id: "c-2",
    slug: "taiwan-strait-military-drills",
    title: "Taiwan Strait: Unprecedented Airspace Violations Documented",
    region: "Indo-Pacific",
    threatLevel: "High Risk",
    updatedAt: "4h ago",
    summary: "A coordinated surge in fighter jet sorties across the median line has forced scrambling of interceptors. Missile defense arrays have been brought online preemptively.",
    category: "Airspace Violation",
    escalationScore: 9.1,
    image: "/images/fallback-geopolitics.jpg",
    source: "Pacific Command",
  },
  {
    id: "c-3",
    slug: "iran-israel-shadow-war",
    title: "Middle East: Cyber Intrusions Target Strategic Energy Grid",
    region: "Middle East",
    threatLevel: "Escalating",
    updatedAt: "6h ago",
    summary: "Advanced persistent threats have infiltrated critical infrastructure networks, prompting a quiet retaliatory kinetic strike on drone manufacturing facilities.",
    category: "Cyber Intrusion",
    escalationScore: 7.8,
    image: "/images/fallback-geopolitics.jpg",
    source: "Signals Intelligence Directorate",
  },
  {
    id: "c-4",
    slug: "ukraine-eastern-front",
    title: "Eastern Europe: Massive Artillery Redeployment Along Frontline",
    region: "Europe",
    threatLevel: "Critical",
    updatedAt: "12h ago",
    summary: "Satellite imagery confirms the movement of heavy mechanized brigades toward contested logistical hubs. Allied nations announce emergency munitions supply drops.",
    category: "Military Movement",
    escalationScore: 9.5,
    image: "/images/fallback-geopolitics.jpg",
    source: "OSINT Analysis Team",
  },
  {
    id: "c-5",
    slug: "red-sea-naval-disruption",
    title: "Red Sea: Asymmetric Drone Strikes Halt Commercial Shipping",
    region: "Middle East / Africa",
    threatLevel: "High Risk",
    updatedAt: "1d ago",
    summary: "Insurgent groups have successfully deployed anti-ship ballistic missiles, causing global freight rates to spike and forcing international navies into a defensive perimeter.",
    category: "Naval Deployment",
    escalationScore: 8.2,
    image: "/images/fallback-geopolitics.jpg",
    source: "Maritime Security Center",
  },
  {
    id: "c-6",
    slug: "india-china-border-surveillance",
    title: "Himalayan Border: Rapid Expansion of High-Altitude Infrastructure",
    region: "South Asia",
    threatLevel: "Escalating",
    updatedAt: "2d ago",
    summary: "New forward operating bases and dual-use helipads have been constructed within disputed territory, significantly shortening troop deployment times during winter.",
    category: "Military Movement",
    escalationScore: 7.4,
    image: "/images/fallback-geopolitics.jpg",
    source: "Geospatial Intelligence Unit",
  }
];

export const TIMELINE_EVENTS = [
  {
    id: "t-1",
    timestamp: "14:30 GMT • Today",
    type: "Naval Deployment",
    description: "Carrier strike group alters course toward the eastern Mediterranean.",
    severity: "high"
  },
  {
    id: "t-2",
    timestamp: "11:15 GMT • Today",
    type: "Sanctions Announced",
    description: "Treasury department freezes assets of shell companies linked to microchip smuggling.",
    severity: "medium"
  },
  {
    id: "t-3",
    timestamp: "08:45 GMT • Today",
    type: "Airspace Violation",
    description: "Reconnaissance drone intercepted flying deep inside sovereign airspace without transponders.",
    severity: "critical"
  },
  {
    id: "t-4",
    timestamp: "23:00 GMT • Yesterday",
    type: "Cyber Intrusion",
    description: "Wiper malware detected on central bank servers of allied nation.",
    severity: "high"
  },
  {
    id: "t-5",
    timestamp: "19:20 GMT • Yesterday",
    type: "Military Movement",
    description: "Train convoys carrying main battle tanks observed moving toward border staging areas.",
    severity: "critical"
  }
];
