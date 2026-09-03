import { config } from "dotenv";
config({ path: "apps/web/.env.local" });
import { tavily } from "@tavily/core";

async function main() {
  const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const res = await client.search("latest news", { topic: "news", maxResults: 1 });
  console.log(JSON.stringify(res.results, null, 2));
}
main().catch(console.error);
