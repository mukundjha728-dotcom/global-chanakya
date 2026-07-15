import mongoose from "mongoose";
import { Country } from "../src/lib/models/Country.js";
import { CountryCategory } from "../src/lib/models/CountryCategory.js";
import { CountryTag } from "../src/lib/models/CountryTag.js";
import { CountryBlog } from "../src/lib/models/CountryBlog.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function seedCountries() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Define core categories
    const categories = [
      "History", "Politics", "Economy", "Military", "Geography", 
      "Culture", "Freedom Fighters", "International Relations", 
      "Intelligence Reports", "Breaking News", "Elections", 
      "Diplomacy", "Trade", "Security"
    ];

    console.log("Seeding CountryCategories...");
    for (const catName of categories) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      await CountryCategory.findOneAndUpdate(
        { slug },
        { name: catName, slug, isActive: true },
        { upsert: true, new: true }
      );
    }

    console.log("Using hardcoded countries for reliable seeding...");
    const data = [
      {
        name: { common: "India", official: "Republic of India" },
        cca2: "IN", cca3: "IND",
        flags: { png: "https://flagcdn.com/w320/in.png" },
        capital: ["New Delhi"],
        population: 1400000000,
        area: 3287263,
        region: "Asia", subregion: "Southern Asia",
        continents: ["Asia"],
        timezones: ["UTC+05:30"],
        languages: { eng: "English", hin: "Hindi" },
        currencies: { INR: { name: "Indian rupee" } },
        latlng: [20.0, 77.0]
      },
      {
        name: { common: "United States", official: "United States of America" },
        cca2: "US", cca3: "USA",
        flags: { png: "https://flagcdn.com/w320/us.png" },
        capital: ["Washington, D.C."],
        population: 331000000,
        area: 9372610,
        region: "Americas", subregion: "North America",
        continents: ["North America"],
        timezones: ["UTC-12:00", "UTC-04:00"],
        languages: { eng: "English" },
        currencies: { USD: { name: "United States dollar" } },
        latlng: [38.0, -97.0]
      },
      {
        name: { common: "China", official: "People's Republic of China" },
        cca2: "CN", cca3: "CHN",
        flags: { png: "https://flagcdn.com/w320/cn.png" },
        capital: ["Beijing"],
        population: 1412000000,
        area: 9596961,
        region: "Asia", subregion: "Eastern Asia",
        continents: ["Asia"],
        timezones: ["UTC+08:00"],
        languages: { zho: "Chinese" },
        currencies: { CNY: { name: "Chinese yuan" } },
        latlng: [35.0, 105.0]
      }
    ];

    console.log(`Found ${data.length} countries. Processing...`);

    let count = 0;
    for (const item of data) {
      // Basic mappings
      const name = item.name.common;
      const officialName = item.name.official;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      const iso2Code = item.cca2;
      const iso3Code = item.cca3;
      const flagUrl = item.flags?.png || item.flags?.svg;
      const capital = item.capital ? item.capital[0] : undefined;
      const population = item.population;
      const area = item.area;
      const region = item.region;
      const subRegion = item.subregion;
      const continent = item.continents ? item.continents[0] : undefined;
      const timeZones = item.timezones || [];
      const languages = item.languages ? Object.values(item.languages) : [];
      const currencyObj = item.currencies ? Object.values(item.currencies)[0] : undefined;
      const currency = currencyObj ? (currencyObj as any).name : undefined;
      const coordinates = item.latlng && item.latlng.length === 2 ? {
        latitude: item.latlng[0],
        longitude: item.latlng[1]
      } : undefined;

      await Country.findOneAndUpdate(
        { slug },
        {
          name,
          officialName,
          slug,
          iso2Code,
          iso3Code,
          flagUrl,
          capital,
          population,
          area,
          currency,
          languages,
          continent,
          region,
          subRegion,
          timeZones,
          coordinates,
          overview: `${name} is a country located in ${region}.`,
          isPublished: true,
          status: "published",
        },
        { upsert: true, new: true }
      );
      count++;
      if (count % 50 === 0) {
        console.log(`Processed ${count} countries...`);
      }
    }

    console.log(`Successfully seeded ${count} countries and core categories.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedCountries();
