import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string }> }): Promise<Metadata> {
  const { countrySlug } = await params;
  return {
    title: `${countrySlug.toUpperCase()} | Intelligence Dashboard | Global Chanakya`,
    description: `Comprehensive geopolitical intelligence, history, and statistics for ${countrySlug}.`,
  };
}

export default async function CountryPage({ params }: { params: Promise<{ countrySlug: string }> }) {
  const { countrySlug } = await params;

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-8">
          <div className="w-32 h-20 bg-gray-800 rounded flex items-center justify-center text-sm">Flag Placeholder</div>
          <div>
            <h1 className="text-5xl font-bold text-[#D4AF37] capitalize">{countrySlug}</h1>
            <p className="text-xl text-gray-400 mt-2">Official Name Placeholder</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {["Capital", "Population", "GDP", "Military Rank"].map((stat) => (
            <div key={stat} className="bg-[#0B1220] p-4 rounded border border-gray-800">
              <p className="text-gray-500 text-sm uppercase tracking-wider">{stat}</p>
              <p className="text-2xl font-bold mt-1">Data</p>
            </div>
          ))}
        </div>

        {/* Overview & Geopolitics */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Strategic Overview</h2>
              <p className="text-gray-300 leading-relaxed bg-[#0B1220] p-6 rounded border border-gray-800">
                Detailed geopolitical overview and strategic importance goes here...
              </p>
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-[#0B1220] p-6 rounded border border-gray-800">
              <h3 className="font-bold text-[#D4AF37] mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-400">
                <li><a href={`/countries/${countrySlug}/history`} className="hover:underline">History & Origins</a></li>
                <li><a href={`/countries/${countrySlug}/military`} className="hover:underline">Military & Defense</a></li>
                <li><a href={`/countries/${countrySlug}/economy`} className="hover:underline">Economic Profile</a></li>
                <li><a href={`/countries/${countrySlug}/politics`} className="hover:underline">Government & Politics</a></li>
                <li><a href={`/countries/${countrySlug}/blog`} className="hover:underline">Latest Intelligence Reports</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
