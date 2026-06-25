import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fact-Checking Policy',
  description: 'Global Chanakya Fact-Checking Policy',
};

export default function FactCheckingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Fact-Checking Policy</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          In the era of information warfare, strict fact-checking is the cornerstone of Global Chanakya.
        </p>
        <h2>Our Process</h2>
        <ul>
          <li>Multiple analyst review for every major geopolitical claim.</li>
          <li>Cross-referencing against state-sponsored media, independent audits, and satellite imagery (when applicable).</li>
          <li>Immediate correction protocols for any discovered inaccuracies.</li>
        </ul>
        {/* Placeholder for detailed fact checking protocol */}
      </div>
    </div>
  );
}
