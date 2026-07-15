import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string, categorySlug: string }> }): Promise<Metadata> {
  const { countrySlug, categorySlug } = await params;
  return {
    title: `${countrySlug.toUpperCase()} ${categorySlug.replace(/-/g, ' ').toUpperCase()} | Global Chanakya`,
    description: `Explore all intelligence reports and data regarding the ${categorySlug.replace(/-/g, ' ')} of ${countrySlug}.`,
  };
}

export default async function CountryCategoryPage({ params }: { params: Promise<{ countrySlug: string, categorySlug: string }> }) {
  const { countrySlug, categorySlug } = await params;

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-gray-800 pb-8">
          <a href={`/countries/${countrySlug}`} className="text-[#D4AF37] hover:underline mb-4 inline-block">
            ← Back to {countrySlug} Overview
          </a>
          <h1 className="text-4xl font-bold text-white capitalize">
            {countrySlug} - {categorySlug.replace(/-/g, ' ')}
          </h1>
          <p className="text-xl text-gray-400 mt-2">
            Intelligence reports and analysis concerning the {categorySlug.replace(/-/g, ' ')} of {countrySlug}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Blog Card */}
          <div className="bg-[#0B1220] p-6 rounded-lg border border-gray-800 hover:border-[#D4AF37] transition-colors">
            <span className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2 block">{categorySlug.replace(/-/g, ' ')}</span>
            <h3 className="text-xl font-bold mb-2">Impact of {categorySlug.replace(/-/g, ' ')} in {countrySlug}</h3>
            <p className="text-sm text-gray-400 mb-4">Excerpt detailing the analysis...</p>
            <a href={`/countries/${countrySlug}/blog/example-report`} className="text-blue-400 hover:underline text-sm">Read Full Report →</a>
          </div>
        </div>
      </div>
    </main>
  );
}
