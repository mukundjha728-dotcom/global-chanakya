import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Source Verification Policy',
  description: 'Global Chanakya Source Verification Policy',
};

export default function SourceVerificationPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Source Verification</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          We rely on a strict hierarchy of sources to build our strategic intelligence reports.
        </p>
        <h2>Source Hierarchy</h2>
        <ul>
          <li><strong>Primary Sources:</strong> Declassified documents, official state broadcasts, and direct interviews.</li>
          <li><strong>Secondary Sources:</strong> Peer-reviewed academic journals and reputable think tanks.</li>
          <li><strong>Tertiary Sources:</strong> High-reputation news aggregators and historical archives.</li>
        </ul>
        {/* Placeholder for detailed source verification policy */}
      </div>
    </div>
  );
}
