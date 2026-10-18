// components/ChatView.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import type { Role } from "@/lib/ai";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  role: Role;
  homeHref: string;
  /**
   * Label kecil di baris atas. Opsional — kalau baris ini kosong semua
   * (tanpa tombol kembali DAN tanpa subtitle) barisnya tidak dirender sama sekali.
   */
  subtitle?: string;
  /**
   * Tampilkan tombol "Kembali" di kiri atas.
   * Default true (dipakai halaman pelanggan). Halaman admin sudah punya
   * Sidebar sehingga tombol kembali & tombol tutup tidak diperlukan.
   */
  showBackButton?: boolean;
  /**
   * Tampilkan tombol "Tutup" (X) di kanan header percakapan ChatBox.
   * Default true. Set false untuk menghilangkan tombol tutup saja.
   */
  showCloseButton?: boolean;
  /**
   * Isi tinggi kontainer, bukan 100vh.
   * Wajib true di dalam shell admin, karena shell sudah mengunci viewport
   * (`h-screen` + scroll di <main>). Kalau false memakai `min-h-screen`
   * supaya halaman mandiri (/chat) tetap penuh.
   */
  fill?: boolean;
}

/**
 * Tampilan bersama untuk halaman chat AI.
 * `role` menentukan persona AI DAN pemisahan riwayat chat
 * (localStorage key per role, lihat ChatBox.tsx).
 */
export default function ChatView({
  role,
  homeHref,
  subtitle,
  showBackButton = true,
  showCloseButton = true,
  fill = false,
}: ChatViewProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${homeHref}`);
    }
  }, [status, router, homeHref]);

  if (status === "loading") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-ink-50",
          fill ? "h-full" : "min-h-screen",
        )}
      >
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const handleClose = () => {
    router.push(homeHref);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-ink-50/60",
        fill
          ? "h-full w-full"
          : "min-h-screen items-center justify-center p-3 sm:p-6",
      )}
    >
      {/* Baris ini hanya perlu kalau ada tombol kembali atau subtitle. */}
      {(showBackButton || subtitle) && (
        <div
          className={cn(
            "mb-4 flex w-full items-center justify-between",
            !fill && "max-w-5xl",
          )}
        >
          {showBackButton ? (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-theme-xs transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <span />
          )}

          {subtitle ? (
            <span className="text-xs font-medium text-ink-500">{subtitle}</span>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Tanpa onClose => tombol "Tutup" di header ChatBox tidak dirender */}
      <div className={cn(fill && "flex min-h-0 flex-1")}>
        <ChatBox
          role={role}
          fill={fill}
          onClose={showCloseButton ? handleClose : undefined}
        />
      </div>
    </div>
  );
}
