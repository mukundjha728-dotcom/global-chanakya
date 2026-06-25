import * as fs from 'fs';
import * as path from 'path';

const modelsDir = path.join(__dirname, '../apps/web/src/lib/models');
const modelsToUpdate = ['Blog.ts', 'Conflict.ts', 'Country.ts', 'Leader.ts', 'Alliance.ts', 'Timeline.ts'];

const standardFields = [
  { name: 'version', iface: 'version: number;', schema: 'version: { type: Number, default: 1 },' },
  { name: 'previousVersions', iface: 'previousVersions?: any[];', schema: 'previousVersions: [{ type: Schema.Types.Mixed }],' },
  { name: 'draftSnapshot', iface: 'draftSnapshot?: any;', schema: 'draftSnapshot: { type: Schema.Types.Mixed },' },
  { name: 'isDeleted', iface: 'isDeleted: boolean;', schema: 'isDeleted: { type: Boolean, default: false },' },
  { name: 'deletedAt', iface: 'deletedAt?: Date;', schema: 'deletedAt: { type: Date },' },
  { name: 'deletedBy', iface: 'deletedBy?: mongoose.Types.ObjectId;', schema: 'deletedBy: { type: Schema.Types.ObjectId, ref: "User" },' },
  { name: 'isBreaking', iface: 'isBreaking?: boolean;', schema: 'isBreaking: { type: Boolean, default: false },' },
  { name: 'isFeatured', iface: 'isFeatured?: boolean;', schema: 'isFeatured: { type: Boolean, default: false },' },
  { name: 'isTrending', iface: 'isTrending?: boolean;', schema: 'isTrending: { type: Boolean, default: false },' },
  { name: 'source', iface: 'source?: string;', schema: 'source: { type: String, default: "manual" },' },
  { name: 'isSystemGenerated', iface: 'isSystemGenerated?: boolean;', schema: 'isSystemGenerated: { type: Boolean, default: false },' },
  { name: 'breakingUntil', iface: 'breakingUntil?: Date;', schema: 'breakingUntil: { type: Date },' },
  { name: 'featuredUntil', iface: 'featuredUntil?: Date;', schema: 'featuredUntil: { type: Date },' },
  { name: 'unpublishAt', iface: 'unpublishAt?: Date;', schema: 'unpublishAt: { type: Date },' },
];

for (const file of modelsToUpdate) {
  const filePath = path.join(modelsDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix mongoose.Schema references if Schema is used directly
  const useSchema = content.includes('import mongoose, { Schema');

  // Insert into interface
  const interfaceRegex = /(export\s+interface\s+I[a-zA-Z]+\s+extends\s+(?:mongoose\.)?Document\s*\{)([\s\S]*?)(\n\})/;
  content = content.replace(interfaceRegex, (match, p1, p2, p3) => {
    let toAppend = '';
    for (const field of standardFields) {
      const regex = new RegExp(`\\b${field.name}\\b\\s*[\\?\\:]`);
      if (!regex.test(p2)) {
        toAppend += `\n  ${field.iface}`;
      }
    }
    return p1 + p2 + toAppend + p3;
  });

  // Insert into Schema
  const schemaRegex = /(const\s+[a-zA-Z]+Schema\s*=\s*new\s+Schema<(?:I[a-zA-Z]+|any)>\(\{)([\s\S]*?)(\}(?:,\s*\{[\s\S]*?\})?\);)/;
  content = content.replace(schemaRegex, (match, p1, p2, p3) => {
    let toAppend = '';
    for (const field of standardFields) {
      const regex = new RegExp(`\\b${field.name}\\b\\s*\\:`);
      if (!regex.test(p2)) {
        let schemaField = field.schema;
        if (!useSchema) schemaField = schemaField.replace(/Schema/g, 'mongoose.Schema');
        toAppend += `\n    ${schemaField}`;
      }
    }
    return p1 + p2 + toAppend + p3;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
