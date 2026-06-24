import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Methodology',
  description: 'Global Chanakya Research Methodology',
};

export default function MethodologyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Research Methodology</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Our research methodology ensures that every piece of intelligence published on Global Chanakya 
          is robust, contextualized, and forward-looking.
        </p>
        <h2>Data Collection</h2>
        <p>We aggregate data from government databases, think tanks, and verified OSINT sources.</p>
        <h2>Analysis Framework</h2>
        <p>Our analysts use historical precedents and game theory models to predict strategic outcomes in active conflicts and alliances.</p>
        {/* Placeholder for detailed methodology */}
      </div>
    </div>
  );
}
