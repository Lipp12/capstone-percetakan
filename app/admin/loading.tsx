import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 rounded-full" />
          <div className="h-7 w-64 bg-slate-200 rounded-xl" />
          <div className="h-3 w-80 bg-slate-100 rounded-full" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded-xl" />
            <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Big Content Card / Chart Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="h-4 w-40 bg-slate-200 rounded-full" />
          <div className="h-3 w-24 bg-slate-100 rounded-full" />
        </div>
        <div className="h-64 w-full bg-slate-100 rounded-2xl flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Memuat data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
