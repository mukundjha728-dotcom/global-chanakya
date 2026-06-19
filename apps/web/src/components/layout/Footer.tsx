import Link from "next/link";
import Image from "next/image";
import { Crown, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { SITE_URL } from "@/constants";

const cols = {
  Analysis: [
    { label: "All Reports", href: "/blogs" },
    { label: "Categories", href: "/categories" },
    { label: "Trending", href: "/blogs?trending=true" },
    { label: "RSS Feed", href: "/feed.xml" },
  ],
  Account: [

    { label: "Sign In", href: "/auth/signin" },
    { label: "Create Account", href: "/auth/signup" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },

  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Image src="/brand/logo.svg" alt="Global Chanakya" width={36} height={36} />
              <div>
                <span className="text-[16px] font-bold tracking-[-0.02em] text-white">
                  Global Chanakya
                </span>
                <p className="text-[10px] font-medium text-neutral-600 tracking-[0.06em] uppercase">
                  Intelligence Platform
                </p>
              </div>
            </Link>
            <p className="text-[13px] text-neutral-500 leading-relaxed max-w-xs">
              In-depth geopolitical analysis and strategic intelligence for the modern decision-maker.
            </p>
            <div className="flex flex-col gap-2 text-[12px] text-neutral-600">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                editorial@globalchanakya.in
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                New Delhi, India
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-neutral-500 hover:text-white transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>



        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
          <p className="text-[11px] text-neutral-600">
            © {new Date().getFullYear()} Global Chanakya Media Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-neutral-600">
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy</Link>

          </div>
        </div>

      </div>
    </footer>
  );
}
