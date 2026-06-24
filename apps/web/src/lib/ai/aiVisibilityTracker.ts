/**
 * aiVisibilityTracker.ts
 * Tracks signals showing our content is successfully crawled or cited by AI bots.
 */

export async function logBotAccess(userAgent: string, url: string) {
  const aiBots = ["GPTBot", "ChatGPT-User", "Anthropic-ai", "PerplexityBot", "Claude-Web", "Google-Extended"];
  
  if (aiBots.some(bot => userAgent.includes(bot))) {
    console.log(`[AI Visibility] Bot Detected: ${userAgent} crawled ${url}`);
    
    // In production:
    // 1. Record hit in MongoDB or PostHog with { bot_name: bot, path: url }
    // 2. Increment "aiCrawlCount" on the specific Blog document.
  }
}
