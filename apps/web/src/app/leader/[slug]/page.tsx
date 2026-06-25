import { Metadata } from "next";
import { notFound } from "next/navigation";
import { User, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { LeaderService } from "@/modules/leader/services/leader.service";
import { TimelineService } from "@/modules/timeline/services/timeline.service";
import { TimelineView } from "@/components/ui/TimelineView";
import { RelatedIntelligenceService } from "@/modules/seo/services/related-intelligence.service";
import { JsonLd, SchemaGenerators } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { RelatedIntelligence } from "@/components/shared/RelatedIntelligence";
import { generateSeoMetadata } from "@repo/utils";
import { Country, ICountry } from "@/lib/models/Country";
import { ILeader } from "@/lib/models/Leader";
import dbConnect from "@/lib/mongoose";
import Link from "next/link";
import { SITE_URL } from "@/constants";
import { auth } from "@/auth";
import { WatchlistService } from "@/modules/watchlist/services/watchlist.service";

export const revalidate = 3600;

const mockLeader = {
  name: "Narendra Modi",
  slug: "narendra-modi",
  title: "Prime Minister",
  party: "Bharatiya Janata Party (BJP)",
  termStart: new Date("2014-05-26"),
  bio: "Narendra Modi has been the Prime Minister of India since 2014. His administration focuses on an assertive foreign policy, economic modernization, and strategic autonomy.",
  foreignPolicyStance: "Multi-alignment strategy, strengthening ties with the West (Quad) while maintaining historical relationships with Russia and prioritizing the Global South.",
  approvalRating: 75,
  tags: ["Nationalism", "Economic Reform", "Digital India", "Act East Policy"],
};

async function getLeader(slug: string) {
  const leader = await LeaderService.getLeaderBySlug(slug);
  if (!leader && slug === "narendra-modi") return mockLeader as unknown as ILeader;
  return leader as ILeader;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const leader = await getLeader(slug);
  if (!leader) return {};

  const title = `${leader.name} | Intelligence Analysis | Global Chanakya`;
  const description = `Geopolitical profile, foreign policy stance, and strategic impact of ${leader.name}, ${leader.title}. Read the deep dive analysis.`;
  const canonicalUrl = `${SITE_URL}/leader/${leader.slug}`;

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl,
    keywords: `${leader.name} foreign policy, ${leader.name} geopolitics, ${leader.title} strategy, ${leader.name} analysis`,
    imageUrl: leader.imageUrl,
    type: "profile",
  });
}

export default async function LeaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leader = await getLeader(slug);
  if (!leader) notFound();

  let country: ICountry | { name: string, slug: string } | null = null;
  if (leader.countryId) {
    await dbConnect();
    country = await Country.findById(leader.countryId).lean<ICountry>();
  } else if (leader.slug === "narendra-modi") {
    country = { name: "India", slug: "india" };
  }

  const session = await auth();
  let isFollowing = false;
  if (session?.user?.id && leader._id) {
    isFollowing = await WatchlistService.isFollowing(session.user.id, "leader", leader._id.toString());
  }

  // Fetch timeline events
  let timelineEvents: any[] = [];
  if (leader._id) {
    timelineEvents = (await TimelineService.getEntityTimeline("leader", leader._id.toString())) as any[];
  }

  const jsonLd = SchemaGenerators.leader(leader, country?.name);
  
  const faqs = [
    { question: `What is the foreign policy stance of ${leader.name}?`, answer: leader.foreignPolicyStance },
    { question: `What is ${leader.name}'s current title?`, answer: `${leader.name} is the ${leader.title} representing the ${leader.party || "government"}.` },
  ];
  const faqSchema = SchemaGenerators.faq(faqs);

  const relatedItems = leader._id 
    ? await RelatedIntelligenceService.getRankedRelations("Leader", leader._id.toString(), leader.tags, 6)
    : [];

  return (
    <div className="bg-[#060606] text-white min-h-screen pt-24 pb-20 px-6">
      <JsonLd schema={jsonLd} />
      <JsonLd schema={faqSchema} />
      <div className="max-w-5xl mx-auto">
        
        <Breadcrumbs items={[
          { name: "Leaders", href: "/leader" },
          { name: leader.name, href: `/leader/${leader.slug}` }
        ]} />
        
        {/* Breadcrumb replacement handled by SEO component above */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center">
              <User className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{leader.name}</h1>
              <div className="text-xl text-neutral-400 font-medium">{leader.title}</div>
            </div>
          </div>
          
          {session?.user ? (
            <form action={async () => {
              "use server";
              await WatchlistService.toggleFollow(session.user!.id, "leader", leader._id.toString());
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-neutral-400" /> Biography
              </h2>
              <p className="text-neutral-400 leading-relaxed text-[15px]">
                {leader.bio}
              </p>
            </section>

            <section className="p-6 rounded-2xl bg-blue-500/[0.02] border border-blue-500/20">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Foreign Policy Stance</h2>
              <p className="text-blue-100/70 leading-relaxed text-[15px]">
                {leader.foreignPolicyStance}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Leadership Timeline
              </h2>
              <TimelineView events={timelineEvents} />
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Key Information</h3>
              <ul className="space-y-4 text-[13px]">
                <li className="flex flex-col gap-1 border-b border-white/[0.05] pb-3">
                  <span className="text-neutral-500">Political Party</span>
                  <span className="text-white font-medium">{leader.party || "Independent"}</span>
                </li>
                <li className="flex flex-col gap-1 border-b border-white/[0.05] pb-3">
                  <span className="text-neutral-500">Term Started</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(leader.termStart).toLocaleDateString()}
                  </span>
                </li>
                {leader.approvalRating && (
                  <li className="flex flex-col gap-1">
                    <span className="text-neutral-500">Approval Rating</span>
                    <span className="text-emerald-400 font-bold text-lg">{leader.approvalRating}%</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Strategic Tags</h3>
              <div className="flex flex-wrap gap-2">
                {leader.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.05] text-[11px] font-medium text-neutral-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Modules */}
        <FaqBlock faqs={faqs} title={`Frequently Asked Questions about ${leader.name}`} />
        <RelatedIntelligence items={relatedItems} />
      </div>
    </div>
  );
}
