import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributor Policy',
  description: 'Global Chanakya Contributor Policy',
};

export default function ContributorPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Contributor Policy</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Global Chanakya accepts submissions from recognized analysts, diplomats, and scholars.
        </p>
        <h2>Guidelines for Submission</h2>
        <ul>
          <li>Must provide unique, data-backed strategic insights.</li>
          <li>Must adhere to our strict neutrality and objectivity standards.</li>
          <li>Must pass our internal peer-review process before publication.</li>
        </ul>
        {/* Placeholder for detailed contributor policy */}
      </div>
    </div>
  );
}
