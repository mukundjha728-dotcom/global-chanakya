import * as fs from 'fs';
import * as path from 'path';

const adminDir = path.join(__dirname, '../apps/web/src/app/admin');

const entities = [
  { id: 'blogs', name: 'Blog' },
  { id: 'countries', name: 'Country' },
  { id: 'leaders', name: 'Leader' },
  { id: 'alliances', name: 'Alliance' },
  { id: 'timelines', name: 'Timeline' },
];

for (const entity of entities) {
  const dirPath = path.join(adminDir, entity.id);
  
  // List Page
  const listContent = [
    'import React from "react";',
    'import GenericList from "@/components/admin/form-engine/GenericList";',
    'import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";',
    '',
    'export const metadata = {',
    `  title: "${entity.name}s | Admin",`,
    '};',
    '',
    `export default function ${entity.name}sPage() {`,
    `  const schema = SCHEMAS["${entity.id}"];`,
    '  if (!schema) return <div>Schema not found</div>;',
    '  return <GenericList schema={schema} />;',
    '}'
  ].join('\n');

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), listContent, 'utf8');

  // New Page
  const newDirPath = path.join(dirPath, 'new');
  if (!fs.existsSync(newDirPath)) fs.mkdirSync(newDirPath, { recursive: true });
  
  const newContent = [
    'import React from "react";',
    'import GenericEditor from "@/components/admin/form-engine/GenericEditor";',
    'import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";',
    '',
    'export const metadata = {',
    `  title: "New ${entity.name} | Admin",`,
    '};',
    '',
    `export default function New${entity.name}Page() {`,
    `  const schema = SCHEMAS["${entity.id}"];`,
    '  if (!schema) return <div>Schema not found</div>;',
    '  return <GenericEditor schema={schema} />;',
    '}'
  ].join('\n');

  fs.writeFileSync(path.join(newDirPath, 'page.tsx'), newContent, 'utf8');

  // Edit Page
  const editDirPath = path.join(dirPath, '[id]');
  if (!fs.existsSync(editDirPath)) fs.mkdirSync(editDirPath, { recursive: true });
  
  const editContent = [
    'import React from "react";',
    'import GenericEditor from "@/components/admin/form-engine/GenericEditor";',
    'import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";',
    '',
    'export const metadata = {',
    `  title: "Edit ${entity.name} | Admin",`,
    '};',
    '',
    `export default async function Edit${entity.name}Page({ params }: { params: { id: string } }) {`,
    '  const { id } = await params;',
    `  const schema = SCHEMAS["${entity.id}"];`,
    '  ',
    '  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";',
    '  let initialData = {};',
    '  try {',
    '    const res = await fetch(`${baseUrl}${schema.apiPath}/${id}`, { cache: "no-store" });',
    '    if (res.ok) {',
    '      const json = await res.json();',
    '      initialData = json.data || json;',
    '    }',
    '  } catch (e) {}',
    '',
    '  if (!schema) return <div>Schema not found</div>;',
    '  ',
    '  return <GenericEditor schema={schema} entityId={id} initialData={initialData} />;',
    '}'
  ].join('\n');

  fs.writeFileSync(path.join(editDirPath, 'page.tsx'), editContent, 'utf8');
  console.log(`Generated ${entity.name} pages.`);
}
