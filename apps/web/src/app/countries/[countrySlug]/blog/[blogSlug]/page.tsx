import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string, blogSlug: string }> }): Promise<Metadata> {
  const { countrySlug, blogSlug } = await params;
  return {
    title: `${blogSlug.replace(/-/g, ' ').toUpperCase()} | ${countrySlug.toUpperCase()} | Global Chanakya`,
    description: `Read the latest intelligence report on ${blogSlug.replace(/-/g, ' ')} regarding ${countrySlug}.`,
  };
}

export default async function CountryBlogPost({ params }: { params: Promise<{ countrySlug: string, blogSlug: string }> }) {
  const { countrySlug, blogSlug } = await params;

  return (
    <main className="min-h-screen bg-[#050816] text-[#F5F5F5] p-8">
      <div className="max-w-4xl mx-auto">
        <a href={`/countries/${countrySlug}/blog`} className="text-[#D4AF37] hover:underline mb-8 inline-block">
          ← Back to {countrySlug} Reports
        </a>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 capitalize leading-tight">
          {blogSlug.replace(/-/g, ' ')}
        </h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-12 pb-8 border-b border-gray-800">
          <span>By Intelligence Desk</span>
          <span>•</span>
          <span>July 2026</span>
          <span>•</span>
          <span className="bg-[#0B1220] px-2 py-1 rounded text-[#D4AF37]">Politics</span>
        </div>

        <article className="prose prose-invert prose-lg max-w-none prose-a:text-[#D4AF37]">
          <p>
            The comprehensive intelligence analysis for {blogSlug.replace(/-/g, ' ')} in the context of {countrySlug}.
            This content will be rendered using the Rich Text Editor content from the database.
          </p>
        </article>
      </div>
    </main>
  );
}
