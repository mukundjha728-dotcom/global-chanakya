import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Country Management | Admin | Global Chanakya",
};

export default function AdminCountriesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Country Management</h1>
        <Link href="/gc-control-9x7k/countries/create" className="bg-[#D4AF37] text-black px-4 py-2 rounded font-bold hover:bg-yellow-600 transition">
          + Add New Country
        </Link>
      </div>

      <div className="bg-[#0B1220] rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#050816] text-xs uppercase text-gray-500 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800 hover:bg-gray-900/50">
              <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                <span className="w-8 h-6 bg-gray-700 rounded block"></span>
                Example Country
              </td>
              <td className="px-6 py-4">Asia</td>
              <td className="px-6 py-4">
                <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs">Published</span>
              </td>
              <td className="px-6 py-4">
                <Link href="/gc-control-9x7k/countries/example-id" className="text-blue-400 hover:underline">Edit</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
