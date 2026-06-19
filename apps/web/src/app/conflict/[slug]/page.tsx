import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flame, Map, AlertTriangle, TrendingDown } from "lucide-react";
import { ConflictService } from "@/modules/conflict/services/conflict.service";
import { TimelineService } from "@/modules/timeline/services/timeline.service";
import { IConflict } from "@/lib/models/Conflict";
import { TimelineView } from "@/components/ui/TimelineView";
import { RelatedIntelligenceService } from "@/modules/seo/services/related-intelligence.service";
import { JsonLd, SchemaGenerators } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { RelatedIntelligence } from "@/components/shared/RelatedIntelligence";
import { generateSeoMetadata } from "@repo/utils";
import { SITE_URL } from "@/constants";
import { auth } from "@/auth";
import { WatchlistService } from "@/modules/watchlist/services/watchlist.service";
import Link from "next/link";

export const revalidate = 3600;

const mockConflict = {
  title: "Russia-Ukraine War",
  slug: "russia-ukraine-war",
  status: "Active",
  startDate: new Date("2022-02-24"),
  regions: ["Eastern Europe", "Black Sea"],
  overview: "A major ongoing conflict triggered by the Russian invasion of Ukraine in 2022, leading to significant geopolitical realignment, NATO expansion, and global economic disruptions.",
  casualties: "Hundreds of thousands",
  economicImpact: "Global energy crisis, inflation spikes, and restructuring of European energy dependency.",
  tags: ["NATO", "Energy Security", "Drone Warfare", "Sanctions"],
  involvedParties: [
    { role: "Aggressor" }, { role: "Defender" } // Mocked relations
  ]
};

async function getConflict(slug: string) {
  const conflict = await ConflictService.getConflictBySlug(slug);
  if (!conflict && slug === "russia-ukraine-war") return mockConflict as unknown as IConflict;
  return conflict as IConflict;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const conflict = await getConflict(slug);
  if (!conflict) return {};

  const title = `${conflict.title} | Intelligence Analysis | Global Chanakya`;
  const description = `Strategic overview, escalation timeline, and geopolitical impact of the ${conflict.title}. Explore real-time intelligence.`;
  const canonicalUrl = `${SITE_URL}/conflict/${conflict.slug}`;

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl,
    keywords: `${conflict.title} conflict, ${conflict.title} war, ${conflict.regions.join(", ")} geopolitics, ${conflict.title} impact`,
    type: "article",
  });
}

export default async function ConflictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const conflict = await getConflict(slug);
  if (!conflict) notFound();

  const session = await auth();
  let isFollowing = false;
  if (session?.user?.id && conflict._id) {
    isFollowing = await WatchlistService.isFollowing(session.user.id, "conflict", conflict._id.toString());
  }

  let timelineEvents: ITimeline[] = [];
  if (conflict._id) {
    timelineEvents = await TimelineService.getEntityTimeline("conflict", conflict._id.toString());
  }

  const jsonLd = SchemaGenerators.conflict(conflict);

  const faqs = [
    { question: `What is the current status of the ${conflict.title}?`, answer: `The conflict is currently ${conflict.status}.` },
    { question: `What regions are affected by the ${conflict.title}?`, answer: `The primary regions affected include ${conflict.regions.join(", ")}.` },
    { question: `What is the economic impact of the ${conflict.title}?`, answer: conflict.economicImpact },
  ];
  const faqSchema = SchemaGenerators.faq(faqs);

  const relatedItems = conflict._id 
    ? await RelatedIntelligenceService.getRankedRelations("Conflict", conflict._id.toString(), conflict.tags, 6)
    : [];

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      <JsonLd schema={jsonLd} />
      <JsonLd schema={faqSchema} />
      <div className="max-w-5xl mx-auto">
        
        <Breadcrumbs items={[
          { name: "Conflicts", href: "/conflict" },
          { name: conflict.title, href: `/conflict/${conflict.slug}` }
        ]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] text-red-400 text-[11px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            {conflict.status} Conflict
          </div>

          {session?.user ? (
            <form action={async () => {
              "use server";
              await WatchlistService.toggleFollow(session.user!.id, "conflict", conflict._id.toString());
            }}>
              <button type="submit" className={`px-6 py-2.5 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                {isFollowing ? 'Following' : '+ Follow'}
              </button>
            </form>
          ) : (
            <Link href="/api/auth/signin" className="px-6 py-2.5 rounded-full font-bold text-sm bg-red-500 text-white hover:bg-red-600">
              Sign In to Follow
            </Link>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white mb-6 leading-tight">
          {conflict.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-neutral-400 mb-12">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05]">
            <Map className="w-4 h-4" />
            {conflict.regions.join(", ")}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05]">
            Since {new Date(conflict.startDate).getFullYear()}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Strategic Overview
              </h2>
              <p className="text-neutral-400 leading-relaxed text-[15px]">
                {conflict.overview}
              </p>
            </section>

            <section className="p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.02]">
              <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> Global Economic Impact
              </h2>
              <p className="text-red-100/70 leading-relaxed text-[15px]">
                {conflict.economicImpact}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Escalation Timeline
              </h2>
              <TimelineView events={timelineEvents} />
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Conflict Metrics</h3>
              <ul className="space-y-4 text-[13px]">
                <li className="flex flex-col gap-1 border-b border-white/[0.05] pb-3">
                  <span className="text-neutral-500">Involved Parties</span>
                  <span className="text-white font-medium">{conflict.involvedParties.length} Primary Actors</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-neutral-500">Estimated Casualties</span>
                  <span className="text-white font-medium">{conflict.casualties || "Unknown"}</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Tactical Tags</h3>
              <div className="flex flex-wrap gap-2">
                {conflict.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.05] text-[11px] font-medium text-neutral-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Modules */}
        <FaqBlock faqs={faqs} title={`Frequently Asked Questions about ${conflict.title}`} />
        <RelatedIntelligence items={relatedItems} />
      </div>
    </div>
  );
}
