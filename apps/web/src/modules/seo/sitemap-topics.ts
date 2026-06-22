import { MetadataRoute } from 'next';
import { TopicService } from './services/topic.service';

import { SITE_URL } from "@/constants";

export async function getTopicSitemaps(): Promise<MetadataRoute.Sitemap> {
  const topics = await TopicService.getAllUniqueTopics();

  return topics.map((t) => ({
    url: `${SITE_URL}/topic/${encodeURIComponent(t.slug || "")}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
}
