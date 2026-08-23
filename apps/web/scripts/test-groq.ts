import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { groqProvider } from "../src/lib/ai/providers/groq.provider";

async function testGroq() {
  console.log("Checking Groq with process.env.GROQ_API_KEY...");
  
  if (!process.env.GROQ_API_KEY) {
    console.log("❌ GROQ_API_KEY is not set in environment.");
    process.exit(1);
  }

  try {
    const result = await groqProvider.generateStructured({
      model: process.env.GROQ_DEFAULT_MODEL || "openai/gpt-oss-120b",
      systemPrompt: "You are a test assistant.",
      userPrompt: "Reply with the word 'HELLO'",
      schema: {
        type: "object",
        properties: {
          reply: { type: "string" }
        },
        required: ["reply"]
      },
      schemaName: "TestSchema"
    });
    
    console.log("✅ Groq API key is valid. Result:", result.data);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Groq Error:", error.message);
    process.exit(1);
  }
}

testGroq().catch(console.error);
