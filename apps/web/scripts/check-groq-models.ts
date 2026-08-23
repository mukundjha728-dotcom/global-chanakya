import { config } from "dotenv";
config({ path: ".env.local" });
import { groqProvider } from "../src/lib/ai/providers/groq.provider";

async function checkModels() {
  if (!process.env.GROQ_API_KEY) {
    console.error("No GROQ_API_KEY found");
    return;
  }
  
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

checkModels();
