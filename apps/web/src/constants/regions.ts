export interface Region {
  id: string;
  slug: string;
  title: string;
  theatre: string;
  strategicWeight: "Critical" | "High" | "Medium";
  lastUpdate: string;
  summary: string;
  category: string;
  keyPlayers: string[];
  image: string;
  trend: "Up" | "Down" | "Stable";
}

export const REGIONS_DATA: Region[] = [
  {
    id: "r-1",
    slug: "indo-pacific-strategic-build-up",
    title: "Indo-Pacific Strategic Build-up",
    theatre: "Indo-Pacific",
    strategicWeight: "Critical",
    lastUpdate: "1h ago",
    summary: "Regional powers are rapidly modernizing naval capabilities and forming trilateral defense pacts to counter unilateral territorial claims.",
    category: "Defense Posture",
    keyPlayers: ["United States", "China", "Japan", "India", "Australia"],
    image: "/images/fallback-geopolitics.jpg",
    trend: "Up",
  },
  {
    id: "r-2",
    slug: "middle-east-oil-corridor-tensions",
    title: "Middle East Oil Corridor Tensions",
    theatre: "Middle East",
    strategicWeight: "Critical",
    lastUpdate: "5h ago",
    summary: "Proxy conflicts threaten to choke off vital maritime choke points, accelerating the shift toward domestic energy independence programs in the West.",
    category: "Energy Security",
    keyPlayers: ["Saudi Arabia", "Iran", "Israel", "United States"],
    image: "/images/fallback-geopolitics.jpg",
    trend: "Up",
  },
  {
    id: "r-3",
    slug: "european-energy-security",
    title: "European Energy Security Realignment",
    theatre: "Europe",
    strategicWeight: "High",
    lastUpdate: "1d ago",
    summary: "The continent completes the severing of legacy pipeline dependencies, heavily subsidizing LNG terminals and decentralized renewables.",
    category: "Economic Strategy",
    keyPlayers: ["European Union", "Russia", "Norway"],
    image: "/images/fallback-geopolitics.jpg",
    trend: "Stable",
  },
  {
    id: "r-4",
    slug: "arctic-military-expansion",
    title: "Arctic Military Expansion",
    theatre: "Polar",
    strategicWeight: "Medium",
    lastUpdate: "3d ago",
    summary: "Melting sea ice has opened new northern shipping routes, prompting immediate deployment of specialized icebreaker fleets and deep-water listening outposts.",
    category: "Territorial Claims",
    keyPlayers: ["Russia", "United States", "Canada"],
    image: "/images/fallback-geopolitics.jpg",
    trend: "Up",
  },
  {
    id: "r-5",
    slug: "africa-rare-earth-diplomacy",
    title: "Africa Rare-Earth Diplomacy",
    theatre: "Africa",
    strategicWeight: "High",
    lastUpdate: "1w ago",
    summary: "A silent scramble for critical minerals essential for semiconductor manufacturing has led to massive infrastructure investments traded for mining rights.",
    category: "Resource Control",
    keyPlayers: ["China", "European Union", "United States", "DRC"],
    image: "/images/fallback-geopolitics.jpg",
    trend: "Up",
  }
];

export const STRATEGIC_SHIFTS = [
  {
    id: "s-1",
    metric: "Power Index",
    theatre: "Indo-Pacific",
    shift: "+12%",
    description: "Naval tonnage deployment increased following joint maritime exercises.",
  },
  {
    id: "s-2",
    metric: "Trade Risk",
    theatre: "Middle East",
    shift: "High Alert",
    description: "Insurance premiums for crude carriers transit increased by 300%.",
  },
  {
    id: "s-3",
    metric: "Military Presence",
    theatre: "Eastern Europe",
    shift: "Surge",
    description: "NATO rapid response battalions permanently stationed at border chokepoints.",
  }
];
