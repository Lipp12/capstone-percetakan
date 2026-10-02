// components/ChatView.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import type { Role } from "@/lib/ai";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ChatViewProps {
  role: Role;
  homeHref: string;
  subtitle: string;
}

/**
 * Tampilan bersama untuk halaman chat AI.
 * `role` menentukan persona AI DAN pemisahan riwayat chat
 * (localStorage key per role, lihat ChatBox.tsx).
 */
export default function ChatView({ role, homeHref, subtitle }: ChatViewProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${homeHref}`);
    }
  }, [status, router, homeHref]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleClose = () => {
    router.push(homeHref);
  };

  return (
    <main className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <span className="text-xs font-medium text-slate-500">{subtitle}</span>
      </div>

      <ChatBox role={role} onClose={handleClose} />
    </main>
  );
}
