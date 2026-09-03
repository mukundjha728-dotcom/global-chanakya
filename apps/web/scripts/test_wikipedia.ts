import { WikipediaImageService } from "../src/modules/blog/services/wikipediaImage.service";

async function runTest() {
  const service = new WikipediaImageService();
  const testQueries = [
    "Israel Hamas conflict",               // country + conflict
    "Indian Navy aircraft carrier",        // military/security event
    "United Nations Security Council",     // diplomatic organization
    "Strait of Malacca",                   // strategic geographic location
    "Global oil supply chain"              // economic/geopolitical issue
  ];

  for (const q of testQueries) {
    console.log(`\n=== Testing Query: "${q}" ===`);
    try {
      const res = await service.searchImage(q);
      if (res) {
        console.log(`Selected Image: ${res.url}`);
        console.log(`Source URL: ${res.sourceUrl}`);
        console.log(`Photographer: ${res.photographerName}`);
        console.log(`Attribution: ${res.attributionHtml}`);
        console.log(`Relevance/Result: SUCCESS`);
      } else {
        console.log(`Relevance/Result: FAILED (No image found or verified)`);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

runTest();
