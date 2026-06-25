import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../.env.local") });

import { SystemConfig } from "../src/lib/models/SystemConfig";
import { User } from "../src/lib/models/User";
import argon2 from "argon2";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function seedProduction() {
  try {
    console.log("Connecting to MongoDB for production seeding...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected.");

    // Limit 1: Create Super Admin if not exists
    console.log("Ensuring super admin exists...");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@globalchanakya.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
      const hashedPassword = await argon2.hash(defaultPassword);
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "superadmin",
        status: "active",
      });
      console.log("Super admin created.");
    }

    // Limit 2: Seed critical System Configs (Navigation, Footer, Default Layout)
    console.log("Ensuring System Config...");
    const configExists = await SystemConfig.findOne();
    if (!configExists) {
      await SystemConfig.create({
        navbarLinks: [
          { label: "Home", url: "/", order: 1, isVisible: true },
          { label: "Conflicts", url: "/conflicts", order: 2, isVisible: true },
          { label: "Regions", url: "/regions", order: 3, isVisible: true },
          { label: "China Watch", url: "/china-watch", order: 4, isVisible: true },
        ],
        footerLinks: [
          { label: "About", url: "/about", order: 1, isVisible: true },
          { label: "Privacy Policy", url: "/privacy", order: 2, isVisible: true },
          { label: "Terms of Service", url: "/terms", order: 3, isVisible: true },
        ],
        homepageSections: [
          { sectionType: "hero", order: 1, isActive: true },
          { sectionType: "breaking", order: 2, isActive: true },
          { sectionType: "trending", order: 3, isActive: true },
        ],
        globalSeo: {
          defaultTitle: "Global Chanakya — Geopolitical Intelligence",
          defaultDescription: "Strategic geopolitical analysis and real-time conflict tracking.",
          defaultImage: "/og-image.png",
        }
      });
      console.log("System Config seeded.");
    }

    console.log("Production seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProduction();
