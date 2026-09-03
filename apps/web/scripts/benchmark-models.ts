import { config } from "dotenv";
config({ path: ".env.local" });
import { GroqProvider } from "../src/lib/ai/providers/groq.provider";
import { askChanakyaJsonSchema } from "../src/lib/intelligence/validators";

async function runBenchmark() {
  const models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini"
  ];

  const questions = [
    "What would a prolonged Iran crisis mean for India's energy security?",
    "What are China's strategic options in the Indo-Pacific?"
  ];

  for (const model of models) {
    console.log(`\n========== BENCHMARKING MODEL: ${model} ==========`);
    const provider = new GroqProvider(); // Key loaded from env

    for (const q of questions) {
      console.log(`\nTesting Q: "${q}"`);
      const start = Date.now();
      try {
        const result = await provider.generateStructured({
          model: model,
          systemPrompt: "You are a geopolitical intelligence engine. Analyze the following request.",
          userPrompt: q,
          schema: askChanakyaJsonSchema,
          schemaName: "AskChanakyaResponse",
          temperature: 0.3,
          maxTokens: 4000
        });
        const end = Date.now();
        const latency = end - start;
        console.log(`✅ Success in ${latency}ms`);
        console.log(`Tokens: Input ${(result as any).metadata?.promptTokens} | Output ${(result as any).metadata?.completionTokens}`);
        // Basic quality check by length of directAssessment
        const responseData = result.data as any;
        console.log(`Direct Assessment Length: ${responseData.directAssessment?.length || 0} chars`);
      } catch (err: any) {
        console.error(`❌ Failed: ${err.message}`);
      }
    }
  }
}

runBenchmark().catch(console.error);
