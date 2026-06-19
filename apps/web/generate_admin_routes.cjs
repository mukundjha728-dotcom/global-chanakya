const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'admin');

const directories = [
  'blogs',
  'users',
  'settings',
  'write',
  'analytics',
  'security',
  'media-library',
  '.' // for admin root (dashboard)
];

const errorTsx = `"use client";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-6">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
        Try again
      </button>
    </div>
  );
}`;

const loadingTsx = `export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}`;

directories.forEach(dir => {
  const dirPath = path.join(adminDir, dir);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write error.tsx
  const errorPath = path.join(dirPath, 'error.tsx');
  if (!fs.existsSync(errorPath)) {
    fs.writeFileSync(errorPath, errorTsx);
  }

  // Write loading.tsx
  const loadingPath = path.join(dirPath, 'loading.tsx');
  if (!fs.existsSync(loadingPath)) {
    fs.writeFileSync(loadingPath, loadingTsx);
  }

  // Write page.tsx if missing
  const pagePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    const pageName = dir === '.' ? 'AdminDashboard' : dir.charAt(0).toUpperCase() + dir.slice(1).replace('-', '');
    fs.writeFileSync(pagePath, `export default function ${pageName}Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white capitalize">${dir === '.' ? 'Dashboard' : dir.replace('-', ' ')}</h1>
      <p className="text-gray-400 mt-2">This module is under construction.</p>
    </div>
  );
}`);
  }
});

console.log('Created missing pages, loading.tsx, and error.tsx files.');
