import { Globe, Users, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "About Global Chanakya - Enterprise Geopolitical Intelligence.",
};

export default function AboutPage() {
  return (
    <div className="py-28 md:py-36 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
            <Globe className="w-4 h-4" /> About Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6 text-white max-w-3xl leading-[1.1]">
            Unvarnished Truth in a <br className="hidden md:block"/> Complex World.
          </h1>
          <p className="text-lg md:text-xl text-white opacity-85 leading-[1.8] font-medium max-w-2xl mx-auto">
            Global Chanakya is a strategic intelligence and geopolitical media platform designed for decision-makers, strategists, and foreign policy enthusiasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-20 mb-20 text-left">
          <div className="p-8 rounded-2xl glass-card border border-[var(--border)] hover:-translate-y-1 transition-transform">
            <Zap className="w-8 h-8 text-[var(--gold)] mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-[var(--muted)] leading-relaxed text-sm">
              To provide predictive, accurate, and unbiased strategic analysis of global events. We cut through the noise of mainstream media to deliver pure intelligence.
            </p>
          </div>
          <div className="p-8 rounded-2xl glass-card border border-[var(--border)] hover:-translate-y-1 transition-transform">
            <Shield className="w-8 h-8 text-[var(--cyan)] mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Our Independence</h3>
            <p className="text-[var(--muted)] leading-relaxed text-sm">
              Funded purely by our community. We take no corporate or government funding, ensuring our analysis remains fiercely independent.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-rose max-w-none text-left">
          <h2 className="text-2xl font-bold text-white mb-4">Open Intelligence Access</h2>
          <p className="text-white opacity-85 leading-[1.8] mb-6">
            We believe in open intelligence. To foster informed strategic discourse, all our flagship intelligence reports are freely accessible to our global community.
          </p>
          
          <h2 className="text-2xl font-bold text-white mb-4 mt-12">Who We Are</h2>
          <p className="text-white opacity-85 leading-[1.8]">
            Our team comprises former diplomats, defense analysts, economic forecasters, and seasoned journalists operating from multiple global hubs.
          </p>
        </div>
      </div>
    </div>
  );
}
