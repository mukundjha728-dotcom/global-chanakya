import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Countries Intelligence Hub | Global Chanakya",
  description: "Comprehensive geopolitical intelligence profiles for every country on Earth.",
};

export default function CountriesDirectoryPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#D4AF37] mb-8">Countries Intelligence Hub</h1>
        <p className="text-lg mb-8 text-gray-300">
          The world's most comprehensive digital intelligence library for every sovereign nation and territory.
        </p>
        
        {/* Placeholder for Search & Filter Bar */}
        <div className="bg-[#0B1220] p-4 rounded-lg mb-8 border border-gray-800">
          <input 
            type="text" 
            placeholder="Search countries by name, region, or ISO code..." 
            className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Placeholder for Country Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* We will fetch and map over countries here */}
          <div className="bg-[#0B1220] p-6 rounded-lg border border-gray-800 hover:border-[#D4AF37] transition-colors cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Example Country</h3>
            <p className="text-sm text-gray-400">Region • Capital</p>
          </div>
        </div>
      </div>
    </main>
  );
}
