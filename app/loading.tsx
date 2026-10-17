import React from "react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full border-2 border-brand-200 opacity-30" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
      <p className="text-xs font-medium text-ink-500">Memuat halaman...</p>
    </div>
  );
}