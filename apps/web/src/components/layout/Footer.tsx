import Link from "next/link";
import Image from "next/image";

// currentYear is computed at server render time. It matches the client at any reasonable
// page load time (same UTC date). suppressHydrationWarning is intentional here: the year
// is genuinely time-dependent and cannot meaningfully differ between SSR and hydration
// within the same page request.
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05070F] border-t border-[#0E1A36] pt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-14 mb-20">
          
          {/* Column 1: Brand Block */}
          <div className="lg:col-span-2 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image
                src="/icon.svg"
                alt="Global Chanakya"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col leading-none gap-1">
                <span className="text-[28px] font-bold tracking-[-0.03em] text-white">
                  Global Chanakya
                </span>
                <span className="text-[11px] font-bold text-[#D4AF37] tracking-[0.22em] uppercase">
                  Intelligence
                </span>
              </div>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-[1.7]">
              Independent geopolitical analysis for policymakers, analysts, and strategic thinkers.
            </p>
          </div>

          {/* Column 2: Strategic Hubs */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Strategic Hubs</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/breaking" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Breaking Intel</Link></li>
              <li><Link href="/blogs" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">All Reports</Link></li>
            </ul>
            <div className="mt-4">
              <a href="https://www.launchory.app/startups/global-chanakya?ref=badge" target="_blank" rel="noopener noreferrer">
                <img src="https://www.launchory.app/api/badge/global-chanakya?theme=dark" alt="Featured on Launchory" width="240" height="54" />
              </a>
            </div>
          </div>

          {/* Column 3: Trust & Ethics */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Trust & Ethics</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/source-verification" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Source Verification</Link></li>
              <li><Link href="/methodology" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Methodology</Link></li>
              <li><Link href="/editorial-policy" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Editorial Policy</Link></li>
              <li><Link href="/fact-checking" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Fact Checking</Link></li>
              <li><Link href="/contributor-policy" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Contributor Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal & Resources */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white text-sm font-bold uppercase tracking-[0.06em]">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Disclaimer</Link></li>
              <li><Link href="/cookie-policy" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/platformseo" className="text-sm text-[var(--muted)] hover:text-[#D4AF37] transition-colors">Platform SEO</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-[#111827] py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)] tracking-wide" suppressHydrationWarning>
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
