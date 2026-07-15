import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Country Blogs Management | Admin | Global Chanakya",
};

export default function AdminCountryBlogsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Country Blogs & Reports</h1>
        <Link href="/gc-control-9x7k/country-blogs/create" className="bg-[#D4AF37] text-black px-4 py-2 rounded font-bold hover:bg-yellow-600 transition">
          + Write New Report
        </Link>
      </div>

      <div className="bg-[#0B1220] rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#050816] text-xs uppercase text-gray-500 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800 hover:bg-gray-900/50">
              <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">
                Example Geopolitical Analysis
              </td>
              <td className="px-6 py-4">India</td>
              <td className="px-6 py-4">Politics</td>
              <td className="px-6 py-4">
                <span className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded text-xs">Draft</span>
              </td>
              <td className="px-6 py-4">
                <Link href="#" className="text-blue-400 hover:underline">Edit</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
