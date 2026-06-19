"use client";
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
}
