import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string }> }): Promise<Metadata> {
  const { countrySlug } = await params;
  return {
    title: `${countrySlug.toUpperCase()} Intelligence Reports & Blogs | Global Chanakya`,
    description: `Latest geopolitical analysis, news, and intelligence reports concerning ${countrySlug}.`,
  };
}

export default async function CountryBlogIndex({ params }: { params: Promise<{ countrySlug: string }> }) {
  const { countrySlug } = await params;

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-8 capitalize">{countrySlug} Intelligence Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loop through country blogs */}
          <div className="bg-[#0B1220] p-6 rounded-lg border border-gray-800 hover:border-[#D4AF37] transition-colors">
            <span className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2 block">Politics</span>
            <h3 className="text-xl font-bold mb-2">Example Intelligence Report</h3>
            <p className="text-sm text-gray-400 mb-4">Brief excerpt of the intelligence report goes here...</p>
            <a href={`/countries/${countrySlug}/blog/example-slug`} className="text-blue-400 hover:underline text-sm">Read Full Report →</a>
          </div>
        </div>
      </div>
    </main>
  );
}
