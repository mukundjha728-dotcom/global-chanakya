import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { Blog } from "../src/lib/models/Blog";
import { Category } from "../src/lib/models/Category";
import { Topic } from "../src/lib/models/Topic";
import { Country } from "../src/lib/models/Country";
import { Region } from "../src/lib/models/Region";
import { Leader } from "../src/lib/models/Leader";
import { Conflict } from "../src/lib/models/Conflict";
import { Organization } from "../src/lib/models/Organization";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

// FORCED DRY-RUN FOR PHASE 2B
const isDryRun = true; 

const CATEGORY_MAP = {
  "Geopolitics": {
    "type": "Category",
    "normalized": "Geopolitics",
    "slug": "geopolitics"
  },
  "Defence": {
    "type": "Category",
    "normalized": "Defence",
    "slug": "defence"
  },
  "Middle East": {
    "type": "Region",
    "normalized": "Middle East",
    "slug": "middle-east"
  },
  "Economy & Trade": {
    "type": "Category",
    "normalized": "Economy & Trade",
    "slug": "economy-trade"
  },
  "Indo-Pacific": {
    "type": "Region",
    "normalized": "Indo-Pacific",
    "slug": "indo-pacific"
  },
  "South Asia": {
    "type": "Region",
    "normalized": "South Asia",
    "slug": "south-asia"
  },
  "China": {
    "type": "Country",
    "normalized": "China",
    "slug": "china"
  },
  "Russia": {
    "type": "Country",
    "normalized": "Russia",
    "slug": "russia"
  },
  "Europe": {
    "type": "Region",
    "normalized": "Europe",
    "slug": "europe"
  },
  "Economy": {
    "type": "Category",
    "normalized": "Economy & Trade",
    "slug": "economy-trade"
  },
  "USA": {
    "type": "Country",
    "normalized": "United States",
    "slug": "united-states"
  },
  "Diplomacy": {
    "type": "Category",
    "normalized": "Diplomacy",
    "slug": "diplomacy"
  },
  "Analysis": {
    "type": "Category",
    "normalized": "Analysis",
    "slug": "analysis"
  }
};
const TAG_MAP = {
  "Donald Trump": {
    "type": "Leader",
    "normalized": "Donald Trump",
    "slug": "donald-trump"
  },
  "China": {
    "type": "Country",
    "normalized": "China",
    "slug": "china"
  },
  "Russia": {
    "type": "Country",
    "normalized": "Russia",
    "slug": "russia"
  },
  "Indo-Pacific": {
    "type": "Region",
    "normalized": "Indo-Pacific",
    "slug": "indo-pacific"
  },
  "NATO": {
    "type": "Organization",
    "normalized": "NATO",
    "slug": "nato"
  },
  "Iran": {
    "type": "Country",
    "normalized": "Iran",
    "slug": "iran"
  },
  "Vladimir Putin": {
    "type": "Leader",
    "normalized": "Vladimir Putin",
    "slug": "vladimir-putin"
  },
  "India": {
    "type": "Country",
    "normalized": "India",
    "slug": "india"
  },
  "BRICS": {
    "type": "Organization",
    "normalized": "BRICS",
    "slug": "brics"
  },
  "Xi Jinping": {
    "type": "Leader",
    "normalized": "Xi Jinping",
    "slug": "xi-jinping"
  },
  "United States": {
    "type": "Country",
    "normalized": "United States",
    "slug": "united-states"
  },
  "Middle East": {
    "type": "Region",
    "normalized": "Middle East",
    "slug": "middle-east"
  },
  "Narendra Modi": {
    "type": "Leader",
    "normalized": "Narendra Modi",
    "slug": "narendra-modi"
  },
  "Israel": {
    "type": "Country",
    "normalized": "Israel",
    "slug": "israel"
  },
  "Diplomacy": {
    "type": "Topic",
    "normalized": "Diplomacy",
    "slug": "diplomacy"
  },
  "Ukraine": {
    "type": "Country",
    "normalized": "Ukraine",
    "slug": "ukraine"
  },
  "South China Sea": {
    "type": "Conflict",
    "normalized": "South China Sea",
    "slug": "south-china-sea"
  },
  "Taiwan": {
    "type": "Country",
    "normalized": "Taiwan",
    "slug": "taiwan"
  },
  "Strait of Hormuz": {
    "type": "Region",
    "normalized": "Strait Of Hormuz",
    "slug": "strait-of-hormuz"
  },
  "USA": {
    "type": "Country",
    "normalized": "United States",
    "slug": "united-states"
  },
  "Strategic Autonomy": {
    "type": "Topic",
    "normalized": "Strategic Autonomy",
    "slug": "strategic-autonomy"
  },
  "De-dollarization": {
    "type": "Topic",
    "normalized": "De-dollarization",
    "slug": "de-dollarization"
  },
  "Critical Minerals": {
    "type": "Topic",
    "normalized": "Critical Minerals",
    "slug": "critical-minerals"
  },
  "Hezbollah": {
    "type": "Leader",
    "normalized": "Hezbollah",
    "slug": "hezbollah"
  },
  "QUAD": {
    "type": "Organization",
    "normalized": "QUAD",
    "slug": "quad"
  },
  "Japan": {
    "type": "Country",
    "normalized": "Japan",
    "slug": "japan"
  },
  "Turkey": {
    "type": "Country",
    "normalized": "Turkey",
    "slug": "turkey"
  },
  "ASEAN": {
    "type": "Organization",
    "normalized": "ASEAN",
    "slug": "asean"
  },
  "Philippines": {
    "type": "Country",
    "normalized": "Philippines",
    "slug": "philippines"
  },
  "South Asia": {
    "type": "Region",
    "normalized": "South Asia",
    "slug": "south-asia"
  },
  "Europe": {
    "type": "Region",
    "normalized": "Europe",
    "slug": "europe"
  },
  "Ukraine War": {
    "type": "Conflict",
    "normalized": "Ukraine War",
    "slug": "ukraine-war"
  },
  "Zelensky": {
    "type": "Leader",
    "normalized": "Zelensky",
    "slug": "zelensky"
  },
  "Pakistan": {
    "type": "Country",
    "normalized": "Pakistan",
    "slug": "pakistan"
  },
  "Nuclear Deterrence": {
    "type": "Topic",
    "normalized": "Nuclear Deterrence",
    "slug": "nuclear-deterrence"
  },
  "Quad": {
    "type": "Organization",
    "normalized": "Quad",
    "slug": "quad"
  },
  "energy security": {
    "type": "Topic",
    "normalized": "Energy Security",
    "slug": "energy-security"
  },
  "South Korea": {
    "type": "Country",
    "normalized": "South Korea",
    "slug": "south-korea"
  },
  "Gaza": {
    "type": "Conflict",
    "normalized": "Gaza",
    "slug": "gaza"
  },
  "Global South": {
    "type": "Region",
    "normalized": "Global South",
    "slug": "global-south"
  },
  "AUKUS": {
    "type": "Organization",
    "normalized": "AUKUS",
    "slug": "aukus"
  },
  "Sanctions": {
    "type": "Topic",
    "normalized": "Sanctions",
    "slug": "sanctions"
  },
  "Lebanon": {
    "type": "Country",
    "normalized": "Lebanon",
    "slug": "lebanon"
  },
  "Saudi Arabia": {
    "type": "Country",
    "normalized": "Saudi Arabia",
    "slug": "saudi-arabia"
  },
  "Red Sea": {
    "type": "Region",
    "normalized": "Red Sea",
    "slug": "red-sea"
  },
  "France": {
    "type": "Country",
    "normalized": "France",
    "slug": "france"
  },
  "Germany": {
    "type": "Country",
    "normalized": "Germany",
    "slug": "germany"
  },
  "Latin America": {
    "type": "Region",
    "normalized": "Latin America",
    "slug": "latin-america"
  },
  "Military Modernization": {
    "type": "Topic",
    "normalized": "Military Modernization",
    "slug": "military-modernization"
  },
  "North Korea": {
    "type": "Country",
    "normalized": "North Korea",
    "slug": "north-korea"
  },
  "Khamenei": {
    "type": "Leader",
    "normalized": "Khamenei",
    "slug": "khamenei"
  },
  "UAE": {
    "type": "Country",
    "normalized": "UAE",
    "slug": "uae"
  },
  "Egypt": {
    "type": "Country",
    "normalized": "Egypt",
    "slug": "egypt"
  },
  "Venezuela": {
    "type": "Country",
    "normalized": "Venezuela",
    "slug": "venezuela"
  },
  "Trade War": {
    "type": "Topic",
    "normalized": "Trade War",
    "slug": "trade-war"
  },
  "Benjamin Netanyahu": {
    "type": "Leader",
    "normalized": "Benjamin Netanyahu",
    "slug": "benjamin-netanyahu"
  },
  "Energy Security": {
    "type": "Topic",
    "normalized": "Energy Security",
    "slug": "energy-security"
  },
  "Australia": {
    "type": "Country",
    "normalized": "Australia",
    "slug": "australia"
  },
  "Kim Jong Un": {
    "type": "Leader",
    "normalized": "Kim Jong Un",
    "slug": "kim-jong-un"
  },
  "Yemen": {
    "type": "Country",
    "normalized": "Yemen",
    "slug": "yemen"
  },
  "Armenia": {
    "type": "Country",
    "normalized": "Armenia",
    "slug": "armenia"
  },
  "Azerbaijan": {
    "type": "Country",
    "normalized": "Azerbaijan",
    "slug": "azerbaijan"
  },
  "Terrorism": {
    "type": "Topic",
    "normalized": "Terrorism",
    "slug": "terrorism"
  },
  "Emmanuel Macron": {
    "type": "Leader",
    "normalized": "Emmanuel Macron",
    "slug": "emmanuel-macron"
  },
  "Poland": {
    "type": "Country",
    "normalized": "Poland",
    "slug": "poland"
  },
  "Drone Warfare": {
    "type": "Topic",
    "normalized": "Drone Warfare",
    "slug": "drone-warfare"
  },
  "Semiconductors": {
    "type": "Topic",
    "normalized": "Semiconductors",
    "slug": "semiconductors"
  },
  "Cuba": {
    "type": "Country",
    "normalized": "Cuba",
    "slug": "cuba"
  },
  "Canada": {
    "type": "Country",
    "normalized": "Canada",
    "slug": "canada"
  },
  "ukraine": {
    "type": "Country",
    "normalized": "Ukraine",
    "slug": "ukraine"
  },
  "russia": {
    "type": "Country",
    "normalized": "Russia",
    "slug": "russia"
  },
  "china": {
    "type": "Country",
    "normalized": "China",
    "slug": "china"
  },
  "iran": {
    "type": "Country",
    "normalized": "Iran",
    "slug": "iran"
  },
  "diplomacy": {
    "type": "Topic",
    "normalized": "Diplomacy",
    "slug": "diplomacy"
  },
  "Arctic": {
    "type": "Region",
    "normalized": "Arctic",
    "slug": "arctic"
  },
  "Syria": {
    "type": "Country",
    "normalized": "Syria",
    "slug": "syria"
  },
  "Eurasia": {
    "type": "Region",
    "normalized": "Eurasia",
    "slug": "eurasia"
  },
  "West Africa": {
    "type": "Region",
    "normalized": "West Africa",
    "slug": "west-africa"
  },
  "terrorism": {
    "type": "Topic",
    "normalized": "Terrorism",
    "slug": "terrorism"
  },
  "Myanmar": {
    "type": "Country",
    "normalized": "Myanmar",
    "slug": "myanmar"
  },
  "Indonesia": {
    "type": "Country",
    "normalized": "Indonesia",
    "slug": "indonesia"
  },
  "Malaysia": {
    "type": "Country",
    "normalized": "Malaysia",
    "slug": "malaysia"
  },
  "Black Sea": {
    "type": "Region",
    "normalized": "Black Sea",
    "slug": "black-sea"
  },
  "Joe Biden": {
    "type": "Leader",
    "normalized": "Joe Biden",
    "slug": "joe-biden"
  },
  "military modernization": {
    "type": "Topic",
    "normalized": "Military Modernization",
    "slug": "military-modernization"
  },
  "Cyber Warfare": {
    "type": "Topic",
    "normalized": "Cyber Warfare",
    "slug": "cyber-warfare"
  },
  "OPEC": {
    "type": "Organization",
    "normalized": "OPEC",
    "slug": "opec"
  },
  "Cyber Espionage": {
    "type": "Topic",
    "normalized": "Cyber Espionage",
    "slug": "cyber-espionage"
  },
  "Disinformation": {
    "type": "Topic",
    "normalized": "Disinformation",
    "slug": "disinformation"
  },
  "AI Deepfakes": {
    "type": "Topic",
    "normalized": "AI Deepfakes",
    "slug": "ai-deepfakes"
  },
  "strategic autonomy": {
    "type": "Topic",
    "normalized": "Strategic Autonomy",
    "slug": "strategic-autonomy"
  },
  "SCO": {
    "type": "Organization",
    "normalized": "SCO",
    "slug": "sco"
  },
  "Multipolarity": {
    "type": "Topic",
    "normalized": "Multipolarity",
    "slug": "multipolarity"
  },
  "Myanmar Crisis": {
    "type": "Conflict",
    "normalized": "Myanmar Crisis",
    "slug": "myanmar-crisis"
  },
  "Nicolas Maduro": {
    "type": "Leader",
    "normalized": "Nicolas Maduro",
    "slug": "nicolas-maduro"
  },
  "Colombia": {
    "type": "Country",
    "normalized": "Colombia",
    "slug": "colombia"
  },
  "sovereign debt": {
    "type": "Topic",
    "normalized": "Sovereign Debt",
    "slug": "sovereign-debt"
  },
  "IMF": {
    "type": "Organization",
    "normalized": "IMF",
    "slug": "imf"
  },
  "dollar hegemony": {
    "type": "Topic",
    "normalized": "Dollar Hegemony",
    "slug": "dollar-hegemony"
  },
  "global south": {
    "type": "Region",
    "normalized": "Global South",
    "slug": "global-south"
  },
  "Bangladesh": {
    "type": "Country",
    "normalized": "Bangladesh",
    "slug": "bangladesh"
  },
  "Muhammad Yunus": {
    "type": "Leader",
    "normalized": "Muhammad Yunus",
    "slug": "muhammad-yunus"
  },
  "Tarique Rahman": {
    "type": "Leader",
    "normalized": "Tarique Rahman",
    "slug": "tarique-rahman"
  },
  "Sheikh Hasina": {
    "type": "Leader",
    "normalized": "Sheikh Hasina",
    "slug": "sheikh-hasina"
  },
  "Jamaat-e-Islami": {
    "type": "Organization",
    "normalized": "Jamaat-e-Islami",
    "slug": "jamaat-e-islami"
  },
  "Nigeria": {
    "type": "Country",
    "normalized": "Nigeria",
    "slug": "nigeria"
  },
  "ISWAP": {
    "type": "Organization",
    "normalized": "ISWAP",
    "slug": "iswap"
  },
  "Boko Haram": {
    "type": "Organization",
    "normalized": "Boko Haram",
    "slug": "boko-haram"
  },
  "Mark Carney": {
    "type": "Leader",
    "normalized": "Mark Carney",
    "slug": "mark-carney"
  },
  "Danielle Smith": {
    "type": "Leader",
    "normalized": "Danielle Smith",
    "slug": "danielle-smith"
  },
  "North America": {
    "type": "Region",
    "normalized": "North America",
    "slug": "north-america"
  },
  "Digital Currency Race": {
    "type": "Topic",
    "normalized": "Digital Currency Race",
    "slug": "digital-currency-race"
  },
  "drone warfare": {
    "type": "Topic",
    "normalized": "Drone Warfare",
    "slug": "drone-warfare"
  },
  "Gray-Zone Warfare": {
    "type": "Topic",
    "normalized": "Gray-Zone Warfare",
    "slug": "gray-zone-warfare"
  },
  "Nuclear Energy": {
    "type": "Topic",
    "normalized": "Nuclear Energy",
    "slug": "nuclear-energy"
  },
  "Supply Chain Security": {
    "type": "Topic",
    "normalized": "Supply Chain Security",
    "slug": "supply-chain-security"
  },
  "Rare Earths": {
    "type": "Topic",
    "normalized": "Rare Earths",
    "slug": "rare-earths"
  },
  "Oman": {
    "type": "Country",
    "normalized": "Oman",
    "slug": "oman"
  },
  "Persian Gulf": {
    "type": "Region",
    "normalized": "Persian Gulf",
    "slug": "persian-gulf"
  },
  "Piyush Goyal": {
    "type": "Leader",
    "normalized": "Piyush Goyal",
    "slug": "piyush-goyal"
  },
  "Yemen Civil War": {
    "type": "Conflict",
    "normalized": "Yemen Civil War",
    "slug": "yemen-civil-war"
  },
  "Caspian Sea": {
    "type": "Region",
    "normalized": "Caspian Sea",
    "slug": "caspian-sea"
  },
  "Ukraine war": {
    "type": "Conflict",
    "normalized": "Ukraine War",
    "slug": "ukraine-war"
  },
  "Central Asia": {
    "type": "Region",
    "normalized": "Central Asia",
    "slug": "central-asia"
  },
  "Raul Castro": {
    "type": "Leader",
    "normalized": "Raul Castro",
    "slug": "raul-castro"
  },
  "Miguel Diaz-Canel": {
    "type": "Leader",
    "normalized": "Miguel Diaz-Canel",
    "slug": "miguel-diaz-canel"
  },
  "sanctions": {
    "type": "Topic",
    "normalized": "Sanctions",
    "slug": "sanctions"
  },
  "multipolarity": {
    "type": "Topic",
    "normalized": "Multipolarity",
    "slug": "multipolarity"
  },
  "Indian Ocean": {
    "type": "Region",
    "normalized": "Indian Ocean",
    "slug": "indian-ocean"
  },
  "Sri Lanka": {
    "type": "Country",
    "normalized": "Sri Lanka",
    "slug": "sri-lanka"
  },
  "Maldives": {
    "type": "Country",
    "normalized": "Maldives",
    "slug": "maldives"
  },
  "Romania": {
    "type": "Country",
    "normalized": "Romania",
    "slug": "romania"
  },
  "climate risk": {
    "type": "Topic",
    "normalized": "Climate Risk",
    "slug": "climate-risk"
  },
  "Iraq": {
    "type": "Country",
    "normalized": "Iraq",
    "slug": "iraq"
  },
  "Ali al-Zaidi": {
    "type": "Leader",
    "normalized": "Ali Al-Zaidi",
    "slug": "ali-al-zaidi"
  }
};

async function runMigration() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  console.log("Starting Taxonomy Migration in " + (isDryRun ? "DRY-RUN" : "EXECUTION") + " mode...\n");
  
  await mongoose.connect(MONGODB_URI);

  const blogs = await Blog.find({}).lean();
  console.log("Total blogs scanned: " + blogs.length);

  let stats = {
    expectedDatabaseWrites: 0,
    expectedBlogUpdates: 0,
    proposedEntities: {
      Category: new Set(),
      Topic: new Set(),
      Country: new Set(),
      Region: new Set(),
      Conflict: new Set(),
      Leader: new Set(),
      Organization: new Set(),
    }
  };

  const entityToBlogMap = new Map();

  for (const blog of blogs) {
    let blogNeedsUpdate = false;

    if (blog.category) {
      const mapped = CATEGORY_MAP[blog.category];
      if (mapped) {
        stats.proposedEntities[mapped.type].add(mapped.slug);
        blogNeedsUpdate = true;
      }
    }

    if (Array.isArray(blog.tags)) {
      for (const tag of blog.tags) {
        const mapped = TAG_MAP[tag];
        if (mapped && mapped.type !== "IGNORE") {
          stats.proposedEntities[mapped.type].add(mapped.slug);
          blogNeedsUpdate = true;
        }
      }
    }

    if (blogNeedsUpdate) {
      stats.expectedBlogUpdates++;
      stats.expectedDatabaseWrites++; 
    }
  }

  for (const type in stats.proposedEntities) {
    stats.expectedDatabaseWrites += stats.proposedEntities[type].size;
  }

  console.log("\n=== DRY-RUN REPORT ===");
  console.log("Blogs Scanned: " + blogs.length);
  console.log("\nProposed Entities By Type:");
  console.log("- Categories: " + stats.proposedEntities.Category.size);
  console.log("- Topics: " + stats.proposedEntities.Topic.size);
  console.log("- Countries: " + stats.proposedEntities.Country.size);
  console.log("- Regions: " + stats.proposedEntities.Region.size);
  console.log("- Conflicts: " + stats.proposedEntities.Conflict.size);
  console.log("- Leaders: " + stats.proposedEntities.Leader.size);
  console.log("- Organizations: " + stats.proposedEntities.Organization.size);

  console.log("\nExpected Writes:");
  console.log("- Entity Creations/Upserts: " + (stats.expectedDatabaseWrites - stats.expectedBlogUpdates));
  console.log("- Blog Document Updates: " + stats.expectedBlogUpdates);
  console.log("- Database Write Operations: " + stats.expectedDatabaseWrites);

  console.log("\n[DRY RUN CONFIRMATION]: ZERO database writes performed.");

  await mongoose.disconnect();
}

runMigration().catch(console.error);
