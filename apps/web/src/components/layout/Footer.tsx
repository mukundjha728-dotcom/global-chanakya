import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05070F] border-t border-[#0E1A36] pt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-20">
          
          {/* Column 1: Brand Block */}
          <div className="lg:col-span-1 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden intel-border flex-shrink-0 bg-black">
                <Image
                  src="/icon.svg"
                  alt="Global Chanakya Logo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[22px] font-bold tracking-[-0.03em] text-white">Global Chanakya</span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#D4AF37] font-semibold mt-1">Strategic Intelligence Platform</span>
              </div>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-[1.7]">
              Independent geopolitical analysis for policymakers, analysts, and strategic thinkers.
            </p>
          </div>

          {/* Column 2: Intelligence */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Intelligence</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/blogs" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Reports</Link></li>
              <li><Link href="/categories" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Terms</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-[#111827] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)] tracking-wide">
            © {currentYear} Global Chanakya Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111827]/50 border border-[#111827] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse shadow-[0_0_8px_var(--cyan)]" />
            LIVE STATUS • OPERATIONAL
          </div>
        </div>

      </div>
    </footer>
  );
}
