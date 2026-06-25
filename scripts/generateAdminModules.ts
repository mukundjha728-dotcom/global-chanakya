import * as fs from 'fs';
import * as path from 'path';

const adminDir = path.join(__dirname, '../apps/web/src/app/admin');

const pages = [
  { path: 'categories', title: 'Categories Manager', desc: 'Manage blog categories.' },
  { path: 'tags', title: 'Tags Manager', desc: 'Manage content tags.' },
  { path: 'countries', title: 'Countries Manager', desc: 'Manage nation states and statistics.' },
  { path: 'leaders', title: 'Leaders Manager', desc: 'Manage geopolitical leaders.' },
  { path: 'alliances', title: 'Alliances Manager', desc: 'Manage treaties and organizations.' },
  { path: 'regions', title: 'Regions Manager', desc: 'Manage global regions and theatres.' },
  { path: 'timelines', title: 'Timelines Manager', desc: 'Manage real-time escalation events.' },
  { path: 'homepage', title: 'Homepage Builder', desc: 'Manage homepage sections, hero, and featured modules.' },
  { path: 'navigation', title: 'Navigation Manager', desc: 'Manage navbar and footer links.' },
  { path: 'seo', title: 'Global SEO Manager', desc: 'Manage canonicals, schema, and AI summaries.' },
  { path: 'media', title: 'Media Library', desc: 'Upload and manage Cloudinary assets.' },
  { path: 'growth', title: 'Growth Dashboard', desc: 'Manage newsletters, trending, and announcements.' },
  { path: 'audit', title: 'Audit Dashboard', desc: 'Track all system changes and actions.' },
  { path: 'health', title: 'System Health', desc: 'Monitor DB, Cache, Cloudinary, and external services.' },
];

for (const page of pages) {
  const dirPath = path.join(adminDir, page.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `import React from "react";

export const metadata = {
  title: "${page.title} | Admin",
};

export default function ${page.title.replace(/\s+/g, '')}Page() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">${page.title}</h1>
          <p className="text-gray-400">${page.desc}</p>
        </div>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-center h-64">
        <p className="text-gray-500 italic">Module scaffolded and ready for implementation.</p>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content, 'utf8');
  console.log('Created', page.path);
}
