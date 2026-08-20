const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/blogs/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update getCachedBlog to populate taxonomy
content = content.replace(
  `const blog = await Blog.findOne({ slug }).populate("author", "name authorSlug bio expertise socialLinks avatar").lean();`,
  `const blog = await Blog.findOne({ slug })
      .populate("author", "name authorSlug bio expertise socialLinks avatar")
      .populate("categoryId", "name slug")
      .populate("topics", "name slug")
      .populate("countries", "name slug")
      .populate("regions", "name slug")
      .populate("leaders", "name slug")
      .populate("conflicts", "name slug")
      .populate("organizations", "name slug")
      .lean();`
);

// 2. Update getCachedRelatedBlogs signature and implementation
content = content.replace(
  `const getCachedRelatedBlogs = unstable_cache(
  async (blogId: string, category: string) => {
    await dbConnect();
    const related = await Blog.find({
      status: "published",
      _id: { $ne: blogId },
      category: category
    }).sort({ publishAt: -1 }).limit(3).lean();
    return JSON.parse(JSON.stringify(related));
  },
  ["related-blogs-cache"],
  { revalidate: 3600, tags: ["blogs"] }
);`,
  `const getCachedRelatedBlogs = unstable_cache(
  async (blog: any) => {
    await dbConnect();
    const conditions = [];
    if (blog.conflicts?.length) conditions.push({ conflicts: { $in: blog.conflicts.map((c: any) => c._id) } });
    if (blog.countries?.length) conditions.push({ countries: { $in: blog.countries.map((c: any) => c._id) } });
    if (blog.regions?.length) conditions.push({ regions: { $in: blog.regions.map((r: any) => r._id) } });
    if (blog.topics?.length) conditions.push({ topics: { $in: blog.topics.map((t: any) => t._id) } });
    if (blog.organizations?.length) conditions.push({ organizations: { $in: blog.organizations.map((o: any) => o._id) } });
    if (blog.leaders?.length) conditions.push({ leaders: { $in: blog.leaders.map((l: any) => l._id) } });
    if (blog.categoryId) conditions.push({ categoryId: blog.categoryId._id });
    
    let related = [];
    if (conditions.length > 0) {
      related = await Blog.find({
        status: "published",
        _id: { $ne: blog._id },
        $or: conditions
      }).sort({ publishAt: -1 }).limit(4).lean();
    } else {
      related = await Blog.find({
        status: "published",
        _id: { $ne: blog._id },
        category: blog.category
      }).sort({ publishAt: -1 }).limit(4).lean();
    }
    return JSON.parse(JSON.stringify(related));
  },
  ["related-blogs-cache-v3"],
  { revalidate: 3600, tags: ["blogs"] }
);`
);

// 3. Update the call to getCachedRelatedBlogs
content = content.replace(
  `const relatedBlogs = await getCachedRelatedBlogs(blog._id, blog.category);`,
  `const relatedBlogs = await getCachedRelatedBlogs(blog);`
);

// 4. Update the bottom tags section to render the new taxonomy relationships
const legacyTagsSection = `{/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
                <div className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--secondary)] mb-2">
                  <Tag className="w-3.5 h-3.5" /> Tracked Topics
                </div>
                {blog.tags.map((tag: string) => (
                  <Link key={tag} href={\`/blogs?tag=\${encodeURIComponent(tag)}\`} className="px-4 py-2 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[12px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}`;

const newTaxonomySection = `{/* Entity Relationships */}
            <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col gap-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--secondary)] mb-2">
                <Tag className="w-3.5 h-3.5" /> Strategic Entities
              </div>
              
              {blog.countries && blog.countries.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Countries</span>
                  {blog.countries.map((entity: any) => (
                    <Link key={entity.slug} href={\`/countries/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}

              {blog.regions && blog.regions.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Regions</span>
                  {blog.regions.map((entity: any) => (
                    <Link key={entity.slug} href={\`/regions/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}

              {blog.topics && blog.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Topics</span>
                  {blog.topics.map((entity: any) => (
                    <Link key={entity.slug} href={\`/topics/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}

              {blog.leaders && blog.leaders.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Leaders</span>
                  {blog.leaders.map((entity: any) => (
                    <Link key={entity.slug} href={\`/leaders/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}

              {blog.organizations && blog.organizations.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Organizations</span>
                  {blog.organizations.map((entity: any) => (
                    <Link key={entity.slug} href={\`/organizations/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}

              {blog.conflicts && blog.conflicts.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cyan)] w-24">Conflicts</span>
                  {blog.conflicts.map((entity: any) => (
                    <Link key={entity.slug} href={\`/conflicts/\${entity.slug}\`} className="px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--secondary)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors">
                      {entity.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>`;

content = content.replace(legacyTagsSection, newTaxonomySection);

fs.writeFileSync(filePath, content);
console.log("Updated blogs/[slug]/page.tsx");
