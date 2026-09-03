const Groq = require("groq-sdk");
require("dotenv").config({ path: ".env.local" });

const TopicDiscoveryJsonSchema = {
  type: "object",
  properties: {
    candidateTopics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          topic: { type: "string", description: "The detailed specific subject matter" },
          reportType: { type: "string", enum: ["Intelligence", "Analysis", "Briefing"] },
          researchRationale: { type: "string", description: "Why this specific topic is highly relevant and requires deeper research today." }
        },
        required: ["title", "topic", "reportType", "researchRationale"],
        additionalProperties: false
      }
    }
  },
  required: ["candidateTopics"],
  additionalProperties: false
};

async function main() {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2 });
  try {
    const res = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: "Give me 1 topic about space." }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "TopicDiscovery",
          strict: true,
          schema: TopicDiscoveryJsonSchema
        }
      }
    });
    console.log("SUCCESS:", res.choices[0].message.content);
  } catch (e) {
    console.error("FAIL:", e.message, e.error);
  }
}
main();
