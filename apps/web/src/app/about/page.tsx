import { Globe, Users, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "About Global Chanakya - Enterprise Geopolitical Intelligence.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Globe className="w-3.5 h-3.5" /> About Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Unvarnished Truth in a <br className="hidden md:block"/> Complex World.
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Global Chanakya is a premium intelligence and geopolitical media platform designed for decision-makers, strategists, and foreign policy enthusiasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
            <Zap className="w-8 h-8 text-amber-500 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              To provide predictive, accurate, and unbiased strategic analysis of global events. We cut through the noise of mainstream media to deliver pure intelligence.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/[0.08]">
            <Shield className="w-8 h-8 text-rose-500 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Our Independence</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Funded purely by our premium subscribers. We take no corporate or government funding, ensuring our analysis remains fiercely independent.
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-rose max-w-none">
          <h2 className="text-2xl font-bold text-white mb-4">The Subscription Model</h2>
          <p className="text-gray-400 mb-6">
            To maintain our independence, we rely on a premium subscription model. Our flagship offering provides a <strong>24-hour early access window</strong> for all our intelligence reports to our premium members at just ₹19 for 7 days.
          </p>
          
          <h2 className="text-2xl font-bold text-white mb-4 mt-12">Who We Are</h2>
          <p className="text-gray-400">
            Our team comprises former diplomats, defense analysts, economic forecasters, and seasoned journalists operating from multiple global hubs.
          </p>
        </div>
      </div>
    </div>
  );
}
