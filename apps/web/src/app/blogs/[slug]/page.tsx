import { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/lib/models/Blog";
import { auth } from "@/auth";
import PremiumLock from "@/components/blogs/PremiumLock";
import Navbar from "@/components/layout/Navbar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const blog = await Blog.findOne({ slug, status: "published" });

  if (!blog) {
    return { title: 'Not Found' };
  }

  return {
    title: blog.seo?.title || blog.title,
    description: blog.seo?.description || blog.excerpt,
    keywords: blog.seo?.keywords || blog.tags,
    openGraph: {
      title: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt,
      images: blog.featuredImage ? [blog.featuredImage] : [],
      type: "article",
      publishedTime: blog.publishAt.toISOString(),
      authors: [blog.author?.name || 'Global Chanakya'],
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const session = await auth();

  const blog = await Blog.findOne({ slug, status: "published" }).populate('author', 'name');

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          {blog.visibility === 'premium' && (
             <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full mb-4">Premium</span>
          )}
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">{blog.title}</h1>
          <div className="flex items-center justify-center space-x-4 text-muted-foreground text-sm">
            <span>By {blog.author?.name || 'Editorial Team'}</span>
            <span>•</span>
            <time>{new Date(blog.publishAt).toLocaleDateString()}</time>
          </div>
        </header>

        <PremiumLock earlyAccessUntil={blog.earlyAccessUntil} userRole={(session?.user as any)?.role}>
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </PremiumLock>

      </main>
    </div>
  );
}
