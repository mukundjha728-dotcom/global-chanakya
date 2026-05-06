export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black text-gray-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last Updated: May 6, 2026</p>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Information Security & Privacy</h2>
            <p className="leading-relaxed">
              At Global Chanakya, we understand that our clients require the highest standards of operational security. This Privacy Policy details how we handle your data with military-grade encryption and strict access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Collection</h2>
            <p className="leading-relaxed mb-4">
              We collect the minimum necessary information required to maintain your account and deliver intelligence briefings. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Corporate email addresses and organizational affiliation</li>
              <li>Authentication credentials (securely hashed via Argon2)</li>
              <li>Reading preferences and intelligence sector interests</li>
              <li>Payment processing information (handled securely by Stripe/Razorpay)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Zero-Knowledge Architecture</h2>
            <p className="leading-relaxed">
              We employ a privacy-first approach. We do not sell, rent, or trade your personal information or reading habits to any third parties, foreign entities, or advertising networks. Your strategic interests remain entirely confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Cookie Policy</h2>
            <p className="leading-relaxed">
              We only use essential session cookies required for authentication and security (NextAuth CSRF and Session tokens). We do not use third-party tracking cookies or invasive analytics scripts.
            </p>
          </section>

          <hr className="border-white/10 my-12" />
          <p className="text-sm text-gray-500">
            For data deletion requests or privacy concerns, please contact dpo@globalchanakya.com
          </p>
        </div>
      </div>
    </div>
  );
}
