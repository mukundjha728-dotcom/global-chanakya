import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Global Chanakya Terms and Conditions govern your use of our geopolitical intelligence platform, including account registration, content usage, intellectual property, advertising, and legal disclaimers.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Terms and Conditions</h1>
        <p className="text-sm text-[var(--muted)] mb-12">Last Updated: July 2026</p>

        <div className="space-y-12 text-white/85 leading-[1.8]">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Global Chanakya Intelligence (&quot;the Platform&quot;), available at <strong>www.globalchanakya.in</strong>, you accept and agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you must not access or use the Platform. These Terms apply to all visitors, registered users, and contributors.
            </p>
            <p className="mt-3">
              We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Platform after any such changes constitutes your acceptance of the revised Terms. We recommend reviewing these Terms periodically to stay informed of updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              Global Chanakya is a geopolitical intelligence and strategic media platform that provides analysis, reports, and commentary on international relations, defence, foreign policy, and global security. Our content is intended for informational and educational purposes and is designed for policymakers, analysts, researchers, students, and informed general readers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
            <p>
              To access certain features of the Platform, you may be required to create a user account. When registering, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Provide accurate, current, and complete information during the registration process</li>
              <li>Maintain and promptly update your account information to keep it accurate and current</li>
              <li>Maintain the security of your password and accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorised use of your account or any other breach of security</li>
              <li>Not share your account credentials with any third party</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate any account that we reasonably believe has been created using false information, is being used in violation of these Terms, or is being used for any fraudulent or malicious purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property Rights</h2>
            <p>
              All intelligence reports, analytical frameworks, articles, graphics, logos, icons, images, and other content published on Global Chanakya (collectively, &quot;Content&quot;) are the property of Global Chanakya Intelligence or our content contributors and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">You are permitted to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>View and read Content for personal, non-commercial use</li>
              <li>Share links to Content on social media and other platforms with proper attribution</li>
              <li>Quote brief excerpts from Content for the purpose of commentary, criticism, or academic citation, provided that the source is clearly attributed to Global Chanakya with a link to the original article</li>
            </ul>
            <p className="mt-3">You are <strong className="text-white">not permitted</strong> to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Reproduce, republish, or redistribute entire articles or substantial portions of Content without prior written permission</li>
              <li>Use automated tools, scrapers, or bots to systematically download or extract Content from the Platform</li>
              <li>Remove, alter, or obscure any copyright, trademark, or proprietary notices from Content</li>
              <li>Use Content for commercial purposes without a licensing agreement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. User Conduct</h2>
            <p>When using the Platform, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Violate any applicable local, national, or international law or regulation</li>
              <li>Post or transmit any content that is abusive, harassing, threatening, defamatory, or hateful</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Attempt to gain unauthorised access to any portion of the Platform, other user accounts, or any systems or networks connected to the Platform</li>
              <li>Interfere with or disrupt the operation of the Platform or servers or networks used to make the Platform available</li>
              <li>Transmit any viruses, worms, defects, Trojan horses, or other items of a destructive nature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers</h2>
            <p>
              The Content on the Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. Global Chanakya does not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>The Content will be accurate, reliable, or error-free</li>
              <li>The Platform will be available at all times without interruption</li>
              <li>Any defects or errors will be corrected</li>
              <li>The Platform is free of viruses or other harmful components</li>
            </ul>
            <p className="mt-3">
              Geopolitical analysis and intelligence reporting inherently involve uncertainty, interpretation, and judgement. Our Content is intended for informational purposes only and should not be construed as professional, legal, financial, military, or diplomatic advice. For a detailed disclaimer, please visit our <Link href="/disclaimer" className="text-[var(--gold)] hover:underline">Disclaimer page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Global Chanakya Intelligence, its officers, directors, employees, agents, and contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Your access to, use of, or inability to use the Platform</li>
              <li>Any Content obtained from the Platform</li>
              <li>Unauthorised access to or alteration of your transmissions or data</li>
              <li>Any actions taken or decisions made based on Content published on the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Advertising</h2>
            <p>
              The Platform may display advertisements provided by third-party advertising networks, including Google AdSense. These advertisements are served by automated systems and are not endorsed by Global Chanakya. We are not responsible for the content, accuracy, or claims made in any advertisements displayed on the Platform.
            </p>
            <p className="mt-3">
              The presence of advertisements on the Platform does not constitute an endorsement of the advertised products or services. For information about how advertising data is collected and used, please see our <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites, services, or resources that are not owned or controlled by Global Chanakya. We do not endorse and are not responsible for the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that we are not responsible for any damage or loss caused by or in connection with the use of any third-party content, goods, or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms. Upon termination, your right to use the Platform will cease immediately. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions of these Terms will remain in full force and effect. The invalid or unenforceable provision will be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
            </p>
          </section>

          <hr className="border-[var(--border)] my-12" />
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us:
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
