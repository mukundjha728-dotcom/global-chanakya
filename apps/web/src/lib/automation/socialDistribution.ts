/**
 * socialDistribution.ts
 * Automates the generation of Twitter threads and LinkedIn posts.
 */

interface GeneratedSocialContent {
  twitterThread: string[];
  linkedInPost: string;
}

export function generateSocialDistribution(title: string, summary: string, insights: string[], url: string): GeneratedSocialContent {
  
  // Twitter Thread construction
  const twitterThread = [
    `🚨 STRATEGIC ALERT: ${title}\n\n${summary}\n\nRead the full intelligence brief 👇\n${url}`,
    `Key Insight 1: ${insights[0] || 'Strategic maneuver detected.'}`,
    `Key Insight 2: ${insights[1] || 'Economic impact projected.'}`,
    `Follow @GlobalChanakya for verified, unbiased geopolitical intelligence. #Geopolitics #ForeignPolicy`
  ];

  // LinkedIn Post construction
  const linkedInPost = `
Strategic Intelligence Brief: ${title}

${summary}

💡 KEY STRATEGIC IMPLICATIONS:
${insights.map(i => `• ${i}`).join('\n')}

We just published a deep-dive analysis on this developing situation, complete with our Entity Graph and Timeline tracking.

Read the full report here: ${url}

#Geopolitics #Strategy #InternationalRelations #GlobalChanakya
  `.trim();

  return { twitterThread, linkedInPost };
}
