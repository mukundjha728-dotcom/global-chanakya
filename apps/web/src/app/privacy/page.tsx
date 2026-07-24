import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Global Chanakya Privacy Policy details how we collect, use, store, and protect your personal data, including information about cookies, third-party services, advertising partners, and your data rights.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted)] mb-12">Last Updated: July 2026</p>

        <div className="space-y-12 text-white/85 leading-[1.8]">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Global Chanakya Intelligence (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting the privacy and security of our users&apos; personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at <strong>www.globalchanakya.in</strong> (the &quot;Site&quot;) and use our services.
            </p>
            <p className="mt-3">
              By accessing or using our Site, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this policy, please do not access the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-bold text-white mt-4 mb-2">2.1 Personal Information You Provide</h3>
            <p>When you create an account, contact us, or interact with our platform, we may collect:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Name and email address (when you register for an account)</li>
              <li>Authentication credentials (passwords are securely hashed using industry-standard algorithms and are never stored in plain text)</li>
              <li>Contact information submitted through our contact form (name, email, subject, message)</li>
              <li>Profile preferences and reading interests that you set in your account</li>
            </ul>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">2.2 Information Collected Automatically</h3>
            <p>When you access our Site, we automatically collect certain information about your device and browsing activity:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>IP address and approximate geographic location (country/region level)</li>
              <li>Browser type, version, and operating system</li>
              <li>Pages visited, time spent on pages, and navigation patterns</li>
              <li>Referring URLs and search terms that led you to our Site</li>
              <li>Device identifiers and screen resolution</li>
            </ul>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">2.3 Cookies & Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our Site. For detailed information about our use of cookies, please see our <Link href="/cookie-policy" className="text-[var(--gold)] hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Account Management:</strong> To create and maintain your user account, authenticate your identity, and provide access to our platform features.</li>
              <li><strong className="text-white">Content Delivery:</strong> To deliver intelligence reports, analysis, and personalised content recommendations based on your reading preferences and interests.</li>
              <li><strong className="text-white">Communication:</strong> To respond to your inquiries, send service-related notifications, and provide customer support through our contact form.</li>
              <li><strong className="text-white">Analytics & Improvement:</strong> To analyse usage patterns, measure the performance of our content, and improve the user experience of our platform.</li>
              <li><strong className="text-white">Security:</strong> To detect and prevent fraudulent activity, protect our platform from abuse, and enforce our terms of service.</li>
              <li><strong className="text-white">Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services & Advertising</h2>
            <h3 className="text-lg font-bold text-white mt-4 mb-2">4.1 Google AdSense</h3>
            <p>
              We use Google AdSense to display advertisements on our Site. Google AdSense uses cookies and web beacons to serve ads based on your prior visits to our Site and other websites on the internet. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our Site and/or other sites on the internet.
            </p>
            <p className="mt-3">
              You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Google Ads Settings</a>. For more information about how Google uses data when you use our Site, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline">Google&apos;s Privacy & Terms page</a>.
            </p>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">4.2 Analytics Services</h3>
            <p>
              We use analytics services to understand how users interact with our platform. These services may collect information about your use of our Site, including pages visited, time on site, and click-through rates. This data is used in aggregate form to improve our content and user experience.
            </p>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">4.3 Contact Form Service</h3>
            <p>
              Our contact form is powered by Web3Forms, a third-party form processing service. When you submit a message through our contact form, your name, email address, and message content are processed by Web3Forms solely for the purpose of delivering your message to our editorial team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing & Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share your information in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Service Providers:</strong> With third-party service providers who assist us in operating our platform (hosting, analytics, email delivery), subject to strict contractual data protection obligations.</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, regulation, court order, or governmental authority.</li>
              <li><strong className="text-white">Protection of Rights:</strong> When necessary to protect our rights, safety, or property, or the rights, safety, or property of our users or the public.</li>
              <li><strong className="text-white">Business Transfer:</strong> In connection with a merger, acquisition, or sale of all or a portion of our assets, subject to the acquiring party agreeing to honour this Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorised access, disclosure, alteration, and destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>HTTPS/TLS encryption for all data transmitted between your browser and our servers</li>
              <li>Secure password hashing using industry-standard cryptographic algorithms</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls limiting who within our organisation can access personal data</li>
              <li>CSRF protection and rate limiting on all API endpoints</li>
            </ul>
            <p className="mt-3">
              While we strive to protect your personal information, no method of transmission over the internet or method of electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to implementing the best practices available.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. Account data is retained for the duration of your account&apos;s active status and for a reasonable period thereafter to address any follow-up inquiries. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Right of Access:</strong> You may request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You may request that we correct any inaccurate or incomplete personal data.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You may request that we delete your personal data, subject to certain legal exceptions.</li>
              <li><strong className="text-white">Right to Restrict Processing:</strong> You may request that we limit the processing of your personal data under certain circumstances.</li>
              <li><strong className="text-white">Right to Data Portability:</strong> You may request a copy of your data in a structured, commonly used, machine-readable format.</li>
              <li><strong className="text-white">Right to Object:</strong> You may object to the processing of your personal data for specific purposes, including direct marketing.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at <strong>editorglobalchanakya.com@gmail.com</strong> with the subject line &quot;Data Rights Request&quot;. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p>
              Our Site is not directed to children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16, we will take steps to delete such information promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
            <p>
              Our platform is hosted on servers that may be located outside your country of residence. By using our Site, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection standards. We take appropriate measures to ensure that your personal data receives an adequate level of protection in the jurisdictions in which we process it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. When we make material changes, we will update the &quot;Last Updated&quot; date at the top of this page and, where appropriate, notify registered users via email. We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          <hr className="border-[var(--border)] my-12" />
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Email: <strong>editorglobalchanakya.com@gmail.com</strong></li>
              <li>Contact form: <Link href="/contact" className="text-[var(--gold)] hover:underline">Contact Page</Link></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
