export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black text-gray-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-12">Last Updated: May 6, 2026</p>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Global Chanakya (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. The Platform provides strategic geopolitical intelligence and analysis intended for enterprise and professional use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Intellectual Property Rights</h2>
            <p className="leading-relaxed">
              All intelligence reports, analytical frameworks, maps, and datasets provided on Global Chanakya are the exclusive property of our network of analysts and are protected by international copyright laws. Unauthorized reproduction or scraping of our data will result in immediate termination of access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Geopolitical forecasting inherently involves uncertainty. The analysis provided on the Platform is for informational and strategic planning purposes only. Global Chanakya shall not be liable for any financial losses or business decisions made based upon our intelligence reports.
            </p>
          </section>

          <hr className="border-white/10 my-12" />
          <p className="text-sm text-gray-500">
            For legal inquiries, please contact legal@globalchanakya.com
          </p>
        </div>
      </div>
    </div>
  );
}
