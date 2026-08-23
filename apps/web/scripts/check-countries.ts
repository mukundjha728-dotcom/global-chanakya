import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dbConnect from "../src/lib/mongoose";
import { Country } from "../src/lib/models/Country";
import { IntelligenceEvent } from "../src/lib/models/IntelligenceEvent";

async function main() {
  await dbConnect();
  
  const allC = await Country.find({}).lean();
  console.log("Total countries:", allC.length);
  console.log("Countries with active status:", allC.filter((c: any) => c.status === "active").length);
  console.log("Countries without status:", allC.filter((c: any) => !c.status).length);

  process.exit(0);
}

main().catch(console.error);
