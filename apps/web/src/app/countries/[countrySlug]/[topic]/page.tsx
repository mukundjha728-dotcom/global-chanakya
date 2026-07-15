import { Metadata } from "next";
import { notFound } from "next/navigation";

// The whitelisted topics that should map directly to this route
const ALLOWED_TOPICS = [
  "history",
  "politics",
  "economy",
  "military",
  "culture",
  "geography",
  "freedom-fighters"
];

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string, topic: string }> }): Promise<Metadata> {
  const { countrySlug, topic } = await params;
  
  if (!ALLOWED_TOPICS.includes(topic)) {
    return {};
  }

  return {
    title: `${countrySlug.toUpperCase()} ${topic.replace(/-/g, ' ').toUpperCase()} | Intelligence Dashboard | Global Chanakya`,
    description: `Comprehensive analysis, statistics, and intelligence reports regarding the ${topic.replace(/-/g, ' ')} of ${countrySlug}.`,
  };
}

export default async function CountryTopicPage({ params }: { params: Promise<{ countrySlug: string, topic: string }> }) {
  const { countrySlug, topic } = await params;

  if (!ALLOWED_TOPICS.includes(topic)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-gray-800 pb-8 flex items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#D4AF37] capitalize">
            {countrySlug} - {topic.replace(/-/g, ' ')}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-[#0B1220] p-8 rounded-lg border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6 capitalize">{topic.replace(/-/g, ' ')} Overview</h2>
              <p className="text-gray-300 leading-relaxed">
                This section provides an in-depth, static overview of the {topic.replace(/-/g, ' ')} of {countrySlug}.
                In the real application, this content would be fetched from the `Country` model's specific sub-fields or related modules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Latest Reports in {topic.replace(/-/g, ' ')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dynamically list blogs tagged with this topic */}
                <div className="bg-[#050816] p-6 rounded border border-gray-700 hover:border-[#D4AF37] transition-colors">
                  <h3 className="font-bold text-lg mb-2">Example Report</h3>
                  <a href={`/countries/${countrySlug}/blog/example`} className="text-blue-400 hover:underline text-sm">Read full report</a>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0B1220] p-6 rounded border border-gray-800">
              <h3 className="font-bold text-white mb-4">Explore {countrySlug}</h3>
              <ul className="space-y-2 text-blue-400">
                {ALLOWED_TOPICS.map((t) => (
                  <li key={t}>
                    <a href={`/countries/${countrySlug}/${t}`} className={`hover:underline capitalize ${t === topic ? 'text-[#D4AF37] font-bold' : ''}`}>
                      {t.replace(/-/g, ' ')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
