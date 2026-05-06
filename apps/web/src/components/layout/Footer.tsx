import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <Globe className="w-6 h-6 text-rose-600" />
            <span className="text-xl font-bold tracking-tighter uppercase">
              Global <span className="text-rose-600">Chanakya</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Enterprise-grade geopolitical intelligence, strategy, and unvarnished analysis for the modern decision maker.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Intelligence</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#latest" className="hover:text-white transition-colors">Latest Briefs</Link></li>
            <li><Link href="#premium" className="hover:text-white transition-colors">Premium Reports</Link></li>
            <li><Link href="/archive" className="hover:text-white transition-colors">Archive</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Desk</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Global Chanakya. All rights reserved.</p>
        <p className="text-xs text-gray-500">Secure 256-bit encrypted portal.</p>
      </div>
    </footer>
  );
}
