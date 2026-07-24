import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Global Chanakya Cookie Policy explains what cookies are, the types of cookies we use (essential, analytics, advertising including Google AdSense), how to manage cookies, and your choices.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-[var(--muted)] mb-12">Last Updated: July 2026</p>

        <div className="space-y-12 text-white/85 leading-[1.8]">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to the website owners. Cookies can be &quot;persistent&quot; (remaining on your device until they expire or are deleted) or &quot;session&quot; cookies (deleted when you close your browser).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
            <p>
              Global Chanakya (&quot;the Platform&quot;) uses cookies and similar technologies for several purposes. Below is a detailed breakdown of the types of cookies we use and their purposes:
            </p>

            <h3 className="text-lg font-bold text-white mt-6 mb-3">2.1 Essential Cookies</h3>
            <p>
              These cookies are strictly necessary for the Platform to function and cannot be switched off in our systems. They are usually set in response to actions you take, such as logging in, setting privacy preferences, or filling in forms. Without these cookies, the services you have requested cannot be provided.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 text-white font-bold">Cookie Name</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Purpose</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-3 px-4 font-mono text-sm">next-auth.session-token</td>
                    <td className="py-3 px-4">User authentication session</td>
                    <td className="py-3 px-4">Session</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-3 px-4 font-mono text-sm">next-auth.csrf-token</td>
                    <td className="py-3 px-4">CSRF protection for form submissions</td>
                    <td className="py-3 px-4">Session</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]/50">
                    <td className="py-3 px-4 font-mono text-sm">gc_fingerprint</td>
                    <td className="py-3 px-4">Session fingerprinting for security</td>
                    <td className="py-3 px-4">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-sm">gc_cookie_consent</td>
                    <td className="py-3 px-4">Stores your cookie consent preference</td>
                    <td className="py-3 px-4">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-white mt-8 mb-3">2.2 Analytics Cookies</h3>
            <p>
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Platform. They help us understand which pages are the most and least popular, how visitors navigate our site, and where they come from. All information these cookies collect is aggregated and therefore anonymous.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-3">2.3 Advertising Cookies (Google AdSense)</h3>
            <p>
              Our Platform displays advertisements served by Google AdSense. Google uses cookies to serve ads based on your visit to our Platform and other websites on the internet. These cookies enable Google and its partners to serve ads to you based on your interests and browsing history.
            </p>
            <p className="mt-3">Key advertising cookies include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Google Advertising Cookies:</strong> Used by Google to display personalised advertisements based on your browsing activity. These cookies track your visits across websites to deliver targeted advertising.</li>
              <li><strong className="text-white">DoubleClick Cookies:</strong> Used by Google&apos;s DoubleClick ad serving technology to track ad impressions, click-through rates, and other ad interaction metrics.</li>
            </ul>
            <p className="mt-3">
              You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Google Ads Settings</a> or by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">www.aboutads.info/choices</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may use various third-party cookies to report usage statistics, deliver advertisements, and provide other functionality. These third-party services include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Google AdSense:</strong> Advertising cookies for serving and personalising ads</li>
              <li><strong className="text-white">Google Fonts:</strong> Web fonts served from Google&apos;s CDN, which may set cookies</li>
            </ul>
            <p className="mt-3">
              We have no control over third-party cookies. Please refer to the respective privacy policies of these services for more information about their cookie practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Managing Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:
            </p>
            <h3 className="text-lg font-bold text-white mt-4 mb-2">Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete existing cookies, or alert you when cookies are being set. Please note that if you choose to block or delete cookies, some features of our Platform may not function properly.
            </p>
            <p className="mt-3">Here are links to cookie settings for popular browsers:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Microsoft Edge</a></li>
            </ul>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">Opt-Out of Personalised Advertising</h3>
            <p>
              To opt out of personalised advertising by Google, visit the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Google Ads Settings page</a>. You can also opt out of some third-party advertising cookies through the <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Network Advertising Initiative opt-out page</a> or the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Digital Advertising Alliance opt-out page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
            </p>
          </section>

          <hr className="border-[var(--border)] my-12" />
          <section>
            <p className="text-[var(--muted)]">
              For questions about this Cookie Policy, please see our <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link> or contact us via our <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact page</Link>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
