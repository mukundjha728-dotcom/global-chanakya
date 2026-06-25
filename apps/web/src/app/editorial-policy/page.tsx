import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description: 'Global Chanakya Editorial Policy',
};

export default function EditorialPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Editorial Policy</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          At Global Chanakya, our editorial policy is rooted in objectivity, accuracy, and rigorous analysis. 
          We strive to provide our readers with unbiased geopolitical intelligence.
        </p>
        <h2>Core Principles</h2>
        <ul>
          <li><strong>Accuracy:</strong> All claims are backed by verified primary and secondary sources.</li>
          <li><strong>Independence:</strong> Our analysis is free from government or corporate influence.</li>
          <li><strong>Transparency:</strong> We clearly distinguish between factual reporting and strategic analysis.</li>
        </ul>
        {/* Placeholder for future detailed policy */}
      </div>
    </div>
  );
}
