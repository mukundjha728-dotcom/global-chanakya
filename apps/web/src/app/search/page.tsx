import { Suspense } from "react";
import SearchContent from "./search-form";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] py-28 text-center text-white">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
