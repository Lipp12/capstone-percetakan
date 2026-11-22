// components/ChatView.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import type { Role } from "@/lib/ai";
import { ArrowLeft, Loader2, Search, Package, Clock, ShoppingBag } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  role: Role;
  homeHref: string;
  channel?: "cs" | "ai";
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
  channel = "cs",
  subtitle,
  showBackButton = true,
  showCloseButton = true,
  fill = false,
}: ChatViewProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className={cn("bg-surface text-on-surface", fill ? "h-full" : "min-h-screen")}>
      {!fill && role === "customer" && (
        <>
          <header className="sticky top-0 z-40 border-b border-outline-variant/40 bg-surface-container-lowest/95 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/dashboard" className="flex items-center">
                <Image src="/logo.png" alt="Faeyza Digital Printing" width={160} height={40} className="h-10 w-auto" priority />
              </Link>
              <nav className="hidden items-center gap-2 md:flex">
                <Link href="/dashboard" className="rounded-full px-3.5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container">Beranda</Link>
                <Link href="/katalog" className="rounded-full px-3.5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container">Katalog Produk</Link>
                <Link href="/orders" className="rounded-full px-3.5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container">Pesanan Saya</Link>
                <span className="rounded-full border border-primary-fixed-dim bg-primary-container px-3.5 py-2 text-xs font-bold text-on-primary-container">
                  {channel === "ai" ? "Chatbot AI" : "Live Chat CS"}
                </span>
              </nav>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-low px-2.5 py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[10px] font-bold text-primary">Pelanggan</span>
                  <span className="block text-xs font-bold text-on-surface">{session?.user?.name?.split(" ")[0] || "User"}</span>
                </span>
              </button>
            </div>
            {menuOpen && (
              <nav className="border-t border-outline-variant/30 px-4 py-3 md:hidden">
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/dashboard" className="rounded-lg bg-surface-container-low px-2 py-2 text-center text-xs font-bold">Beranda</Link>
                  <Link href="/katalog" className="rounded-lg bg-surface-container-low px-2 py-2 text-center text-xs font-bold">Katalog</Link>
                  <Link href="/orders" className="rounded-lg bg-surface-container-low px-2 py-2 text-center text-xs font-bold">Pesanan</Link>
                </div>
              </nav>
            )}
          </header>
          <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-primary">
                  <Link href="/dashboard" className="hover:underline">Studio Hub</Link>
                  <span>/</span>
                  <span>Konsultasi Cetak</span>
                </div>
                <h1 className="font-epilogue text-2xl font-bold text-on-surface sm:text-3xl">
                  {channel === "ai" ? "Chatbot AI Faeyza" : "Chat dengan Tim CS"}
                </h1>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {channel === "ai"
                    ? "Asisten pintar untuk rekomendasi bahan, desain, dan estimasi cetak."
                    : "Hubungi Admin CS untuk bantuan pesanan, revisi, dan status produksi."}
                </p>
              </div>
              {showBackButton && (
                <button type="button" onClick={handleClose} className="hidden items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-on-surface-variant sm:flex">
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali
                </button>
              )}
            </div>
            <div className="mx-auto h-[620px] max-w-[1120px]">
              <ChatBox role={role} channel={channel} fill onClose={showCloseButton ? handleClose : undefined} />
            </div>
          </main>
        </>
      )}
      {(fill || role === "admin") && (
        <div className={cn("flex h-full w-full", !fill && "min-h-screen items-center justify-center p-3 sm:p-6")}>
          <ChatBox role={role} channel={channel} fill={fill} onClose={showCloseButton ? handleClose : undefined} />
        </div>
      )}
    </div>
  );
}
