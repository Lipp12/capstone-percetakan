// components/FloatingSupport.tsx
"use client";

import Link from "next/link";

export default function FloatingSupport() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="bg-surface-container-lowest/95 backdrop-blur-md border-none rounded-2xl shadow-[3px_3px_0px_#2D2926] p-2 flex flex-col sm:flex-row items-center gap-2">
        <Link
          href="/chat"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-sm"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-tertiary group-hover:scale-110 transition-transform">
              support_agent
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface-container-lowest" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold leading-none">Live Chat Admin</span>
            <span className="font-label-caps text-label-caps text-tertiary">Online (1-2 mnt)</span>
          </div>
        </Link>
        <div className="hidden sm:block w-[1px] h-7 bg-surface-container-high" />
        <Link
          href="/chat?mode=ai"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
            smart_toy
          </span>
          <div className="flex flex-col text-left">
            <span className="font-bold leading-none">Chatbot AI Faeyza</span>
            <span className="font-label-caps text-label-caps opacity-80">Bantuan Cepat 24/7</span>
          </div>
        </Link>
      </div>
    </div>
  );
}