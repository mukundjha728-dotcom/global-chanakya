import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Country | Admin | Global Chanakya",
};

export default function AdminCountryCreatePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Add New Country</h1>
      <form className="bg-[#0B1220] p-6 rounded-lg border border-gray-800 max-w-4xl space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Country Name</label>
            <input type="text" className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700" placeholder="e.g. India" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Slug</label>
            <input type="text" className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700" placeholder="e.g. india" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Overview (Markdown Supported)</label>
          <textarea rows={5} className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700" placeholder="Detailed strategic overview..."></textarea>
        </div>

        {/* Placeholder for Stats & other uploads */}
        <div className="bg-[#050816] p-4 border border-gray-800 rounded">
          <p className="text-gray-400 text-sm mb-4">Stats & Images (Placeholder for Cloudinary upload widgets & numerical inputs)</p>
        </div>

        <button type="submit" className="bg-[#D4AF37] text-black px-6 py-3 rounded font-bold hover:bg-yellow-600 transition">
          Save Country
        </button>
      </form>
    </div>
  );
}
