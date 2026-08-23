import { Groq } from "groq-sdk";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function getModels() {
  if (!process.env.GROQ_API_KEY) {
    console.log("MISSING API KEY");
    return;
  }
  
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = await groq.models.list();
    console.log("AVAILABLE MODELS:");
    models.data.forEach(m => console.log(m.id));
  } catch (e: any) {
    console.error("FAILED TO GET MODELS:", e.message);
  }
}

getModels();
