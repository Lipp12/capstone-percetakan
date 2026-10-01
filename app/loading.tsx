import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 animate-in fade-in duration-200">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-3 border-blue-200 animate-ping opacity-30" />
        <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs text-slate-500 font-medium">Memuat halaman...</p>
    </div>
  );
}
