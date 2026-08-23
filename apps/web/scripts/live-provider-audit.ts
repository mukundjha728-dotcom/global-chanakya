import { RSSProvider } from "../src/lib/intelligence/live/providers/rss.provider";

async function run() {
  console.log("=== LIVE PROVIDER AUDIT ===");
  const providers = [
    new RSSProvider("BBC", "http://feeds.bbci.co.uk/news/world/rss.xml"),
    new RSSProvider("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
    new RSSProvider("UN News", "https://news.un.org/feed/subscribe/en/news/all/rss.xml")
  ];

  let allPass = true;
  for (const provider of providers) {
    try {
      console.log(`Auditing ${provider.name}...`);
      const events = await provider.fetchLatestEvents();
      if (events.length > 0) {
        console.log(`[PASS] ${provider.name} returned ${events.length} events.`);
      } else {
        console.warn(`[WARN] ${provider.name} returned 0 events. (Could be empty feed or parser issue)`);
        allPass = false;
      }
    } catch (e: any) {
      console.error(`[FAIL] ${provider.name} failed:`, e.message);
      allPass = false;
    }
  }

  if (!allPass) {
    console.warn("Some providers failed or returned 0 items. Ensure network allows RSS fetching.");
  } else {
    console.log("All providers passed.");
  }
  process.exit(0);
}
run();
