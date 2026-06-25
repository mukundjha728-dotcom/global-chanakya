import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shield, Users, BarChart3, Globe } from "lucide-react";
import { CountryService } from "@/modules/geo/services/country.service";
import { LeaderService } from "@/modules/leader/services/leader.service";
import { TimelineService } from "@/modules/timeline/services/timeline.service";
import { ConflictService } from "@/modules/conflict/services/conflict.service";
import { RelatedIntelligenceService } from "@/modules/seo/services/related-intelligence.service";
import { TimelineView } from "@/components/ui/TimelineView";
import { JsonLd, SchemaGenerators } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { RelatedIntelligence } from "@/components/shared/RelatedIntelligence";
import { generateSeoMetadata } from "@repo/utils";
import { ICountry } from "@/lib/models/Country";
import { ILeader } from "@/lib/models/Leader";
import { IConflict } from "@/lib/models/Conflict";

import Link from "next/link";
import { SITE_URL } from "@/constants";
import { auth } from "@/auth";
import { WatchlistService } from "@/modules/watchlist/services/watchlist.service";

export const revalidate = 3600; // Cache for 1 hour

// Mock fallback data for demonstration if DB is empty
const mockCountry = {
  name: "India",
  slug: "india",
  isoCode: "IN",
  region: "South Asia",
  overview: "India is an emerging global superpower with the world's largest population and a rapidly growing economy. It plays a crucial role in the Indo-Pacific strategy and maintains a policy of multi-alignment.",
  capital: "New Delhi",
  population: 1428000000,
  gdp: "$3.7 Trillion",
  alliances: ["BRICS", "Quad", "SCO", "G20"],
  intelligenceScore: 88,
  geopoliticalStatus: "Emerging",
  seo: {
    title: "India Geopolitical Intelligence & Strategic Profile",
    description: "In-depth geopolitical intelligence, foreign policy analysis, and strategic overview of India.",
  }
};

async function getCountry(slug: string) {
  const country = await CountryService.getCountryBySlug(slug);
  if (!country && slug === "india") return mockCountry as unknown as ICountry;
  return country as ICountry;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountry(slug);
  if (!country) return {};

  const title = country.seo?.title || `${country.name} | Intelligence Analysis | Global Chanakya`;
  const description = country.seo?.description || `In-depth geopolitical intelligence, foreign policy analysis, and strategic overview of ${country.name}. Discover its alliances, conflicts, and global ranking.`;
  const canonicalUrl = `${SITE_URL}/country/${country.slug}`;

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl,
    keywords: `${country.name} geopolitics, ${country.name} foreign policy, ${country.name} alliances, ${country.region} intelligence, ${country.capital} strategy`,
    imageUrl: country.flagUrl,
    type: "article",
  });
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = await getCountry(slug);
  
  if (!country) {
    notFound();
  }

  // Fetch leaders (mocking if using fallback)
  let leaders: (ILeader | { name: string, title: string, slug: string, party: string })[] = [];
  if (country._id) {
    leaders = await LeaderService.getLeadersByCountry(country._id as any);
  } else if (country.slug === "india") {
    leaders = [{ name: "Narendra Modi", title: "Prime Minister", slug: "narendra-modi", party: "BJP" }];
  }

  const session = await auth();
  let isFollowing = false;
  if (session?.user?.id && country._id) {
    isFollowing = await WatchlistService.isFollowing(session.user.id, "country", country._id.toString());
  }

  // Fetch timeline events
  let timelineEvents: any[] = [];
  if (country._id) {
    timelineEvents = (await TimelineService.getEntityTimeline("country", country._id.toString())) as any[];
  }

  // Fetch related conflicts
  let conflicts: IConflict[] = [];
  if (country._id) {
    conflicts = await ConflictService.getConflictsByCountry(country._id.toString());
  }

  // Build FAQs
  const faqs = [
    { question: `What is the geopolitical status of ${country.name}?`, answer: `${country.name} is classified as a ${country.geopoliticalStatus} with an intelligence score of ${country.intelligenceScore}/100.` },
    { question: `What are ${country.name}'s key alliances?`, answer: `Key alliances include: ${country.alliances.join(", ")}.` },
    { question: `What is the population and GDP of ${country.name}?`, answer: `${country.name} has a population of approx ${Math.round(country.population / 1000000)}M and a GDP of ${country.gdp || "N/A"}.` }
  ];

  // Build Related Intelligence items
  const relatedItems = country._id 
    ? await RelatedIntelligenceService.getRankedRelations("Country", country._id.toString(), country.alliances, 6)
    : [
        ...leaders.map(l => ({ type: "leader", title: l.name, slug: l.slug, subtitle: l.title })),
        ...conflicts.map(c => ({ type: "conflict", title: c.title, slug: c.slug, subtitle: c.status }))
      ] as any[];

  const jsonLd = SchemaGenerators.country(country);
  const faqSchema = SchemaGenerators.faq(faqs);

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      <JsonLd schema={jsonLd} />
      <JsonLd schema={faqSchema} />
      
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[
          { name: "Countries", href: "/country" },
          { name: country.name, href: `/country/${country.slug}` }
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/20">
              {country.isoCode}
            </div>
            <div>
              <div className="flex items-center gap-2 text-neutral-400 text-[13px] font-medium uppercase tracking-wider mb-1">
                <Globe className="w-4 h-4" />
                {country.region}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                {country.name}
              </h1>
            </div>
          </div>
          
          {session?.user ? (
            <form action={async () => {
              "use server";
              await WatchlistService.toggleFollow(session.user!.id, "country", country._id.toString());
            }}>
              <button type="submit" className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'bg-emerald-500 text-[#060606] hover:bg-emerald-400'}`}>
                {isFollowing ? 'Following' : '+ Follow'}
              </button>
            </form>
          ) : (
            <Link href="/api/auth/signin" className="px-6 py-2.5 rounded-full font-bold text-sm bg-emerald-500 text-[#060606] hover:bg-emerald-400">
              Sign In to Follow
            </Link>
          )}
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-neutral-500 text-[12px] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Status
            </div>
            <div className="text-lg font-semibold text-white">{country.geopoliticalStatus}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-neutral-500 text-[12px] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Population
            </div>
            <div className="text-lg font-semibold text-white">{(country.population / 1000000).toFixed(1)}M</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-neutral-500 text-[12px] uppercase tracking-wider mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> GDP
            </div>
            <div className="text-lg font-semibold text-white">{country.gdp || "N/A"}</div>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20">
            <div className="text-emerald-500/70 text-[12px] uppercase tracking-wider mb-2">
              Intelligence Score
            </div>
            <div className="text-2xl font-bold text-emerald-400">{country.intelligenceScore}/100</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-4">Strategic Overview</h2>
              <p className="text-neutral-400 leading-relaxed text-[15px]">
                {country.overview}
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-4">Key Alliances & Memberships</h2>
              <div className="flex flex-wrap gap-2">
                {country.alliances.map((alliance: string) => (
                  <span key={alliance} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[13px] font-medium">
                    {alliance}
                  </span>
                ))}
              </div>
            </section>

            {/* Timeline View */}
            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Historical Timeline
              </h2>
              <TimelineView events={timelineEvents} />
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Key Leadership</h3>
              <div className="flex flex-col gap-4">
                {leaders.map((leader) => (
                  <Link href={`/leader/${leader.slug}`} key={leader.slug} className="flex flex-col group">
                    <span className="text-white font-medium group-hover:text-amber-400 transition-colors">{leader.name}</span>
                    <span className="text-neutral-500 text-[12px]">{leader.title}</span>
                  </Link>
                ))}
                {leaders.length === 0 && <span className="text-neutral-600 text-sm">No leadership data available.</span>}
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Quick Facts</h3>
              <ul className="space-y-3 text-[13px]">
                <li className="flex justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-neutral-500">Capital</span>
                  <span className="text-white font-medium">{country.capital}</span>
                </li>
                <li className="flex justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-neutral-500">ISO Code</span>
                  <span className="text-white font-medium">{country.isoCode}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Modules */}
        <FaqBlock faqs={faqs} title={`Frequently Asked Questions about ${country.name}`} />
        <RelatedIntelligence items={relatedItems} />
      </div>
    </div>
  );
}
