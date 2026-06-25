import React from "react";
import MediaLibrary from "@/components/admin/media/MediaLibrary";

export const metadata = {
  title: "Media Library | Admin",
};

export default function MediaLibraryPage() {
  return (
    <div className="flex-1 bg-[var(--bg)] min-h-screen">
      <MediaLibrary />
    </div>
  );
}
