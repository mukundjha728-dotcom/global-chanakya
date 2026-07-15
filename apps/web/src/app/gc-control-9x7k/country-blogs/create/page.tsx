import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Country Blog | Admin | Global Chanakya",
};

export default function AdminCountryBlogCreatePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Write Country Intelligence Report</h1>
      <form className="bg-[#0B1220] p-6 rounded-lg border border-gray-800 max-w-5xl space-y-8">
        
        {/* Assignment Section */}
        <section className="bg-[#050816] p-4 rounded border border-gray-800">
          <h2 className="text-[#D4AF37] font-bold mb-4">Assignment</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Country</label>
              <select className="w-full bg-[#0B1220] text-white p-3 rounded border border-gray-700">
                <option value="">Select Country...</option>
                <option value="india">India</option>
                <option value="us">United States</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select className="w-full bg-[#0B1220] text-white p-3 rounded border border-gray-700">
                <option value="">Select Category...</option>
                <option value="politics">Politics</option>
                <option value="history">History</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags</label>
              <input type="text" className="w-full bg-[#0B1220] text-white p-3 rounded border border-gray-700" placeholder="e.g. Elections, Diplomacy" />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-6">
          <h2 className="text-[#D4AF37] font-bold">Content</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Report Title</label>
            <input type="text" className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700 text-lg font-bold" placeholder="Enter title here..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Excerpt</label>
            <textarea rows={3} className="w-full bg-[#050816] text-white p-3 rounded border border-gray-700" placeholder="Brief summary..."></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rich Text Editor (TipTap Integration Placeholder)</label>
            <div className="w-full h-64 bg-[#050816] rounded border border-gray-700 flex items-center justify-center text-gray-600">
              [Rich Text Editor Component]
            </div>
          </div>
        </section>

        {/* SEO Section */}
        <section className="bg-[#050816] p-4 rounded border border-gray-800">
          <h2 className="text-[#D4AF37] font-bold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Title</label>
              <input type="text" className="w-full bg-[#0B1220] text-white p-2 rounded border border-gray-700" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
              <textarea className="w-full bg-[#0B1220] text-white p-2 rounded border border-gray-700"></textarea>
            </div>
          </div>
        </section>

        <button type="submit" className="bg-[#D4AF37] text-black px-6 py-3 rounded font-bold hover:bg-yellow-600 transition w-full">
          Publish Report
        </button>
      </form>
    </div>
  );
}
