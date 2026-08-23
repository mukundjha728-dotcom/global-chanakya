import { matchEntity } from "../src/lib/intelligence/live/entityResolver";

async function main() {
  console.log("=== 4. ENTITY RESOLVER PRECISION TEST ===");
  
  const mockCountries = [
    { _id: "c1", name: "United States", aliases: ["USA", "US", "U.S.", "America"] },
    { _id: "c2", name: "India", aliases: ["Bharat"] },
    { _id: "c3", name: "United Kingdom", aliases: ["UK", "Britain"] },
  ];

  const tests = [
    // Positive Canonical
    { text: "The United States is huge.", expected: ["c1"] },
    { text: "United kingdom announced new rules.", expected: ["c3"] },
    // Positive Alias
    { text: "USA is growing.", expected: ["c1"] },
    { text: "The U.S. economy...", expected: ["c1"] },
    { text: "Bharat is ancient.", expected: ["c2"] },
    // Case variation
    { text: "INDIA won the match.", expected: ["c2"] },
    // Negative partial words
    { text: "An indian programmer...", expected: [] },
    { text: "I have a bus.", expected: [] }, // "us" shouldn't match "US" because of bounded token logic or word boundaries if implemented, wait, USA/US are exact alias. If "bus" is used, does it substring match?
    { text: "A user is here.", expected: [] },
    // Unknown entities
    { text: "Germany is in Europe.", expected: [] }
  ];

  let positiveMatches = 0;
  let negativeMatches = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const t of tests) {
    const res = matchEntity(t.text, mockCountries);
    const matchedIds = res.map(r => r.entityId);
    
    // Compare sets
    const isMatch = matchedIds.length === t.expected.length && matchedIds.every(id => t.expected.includes(id));
    
    if (isMatch) {
      if (t.expected.length > 0) positiveMatches++;
      else negativeMatches++;
    } else {
      if (t.expected.length > 0 && matchedIds.length === 0) falseNegatives++;
      else falsePositives++;
      console.log(`FAIL: "${t.text}" => Got ${JSON.stringify(matchedIds)}, Expected ${JSON.stringify(t.expected)}`);
    }
  }

  console.log(`Positive matches: ${positiveMatches}`);
  console.log(`Negative matches: ${negativeMatches}`);
  console.log(`False Positives: ${falsePositives}`);
  console.log(`False Negatives: ${falseNegatives}`);
}

main().catch(console.error);
