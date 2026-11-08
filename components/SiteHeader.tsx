// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/95 backdrop-blur-md shadow-sm">
      <div className="w-full bg-[#2D2926] text-[#fae28c] text-[11px] font-label-caps uppercase tracking-wider py-1.5 px-4 text-center overflow-hidden flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-[#fae28c]">precision_manufacturing</span>
        <span>MESIN DIGITAL PRINTING &amp; OFFSET BERPRESISI • FREE PREPRESS FILE AUDIT • KALIBRASI CMYK FOGRA39 AKURAT • KUALITAS STUDIO TERJAMIN</span>
      </div>

      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Faeyza Digital Printing"
            width={160}
            height={40}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className="px-4 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
            Beranda
          </Link>
          <Link href="/katalog" className="px-4 py-2 rounded-full font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed font-bold shadow-[2px_2px_0px_#2D2926]">
            Produk
          </Link>
          <Link href="/orders" className="px-4 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
            Pesanan Saya
          </Link>
          <Link href="/help" className="px-4 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all">
            Bantuan
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer shadow-xs">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed overflow-hidden flex-shrink-0 ring-1 ring-primary-container">
                <span className="w-full h-full flex items-center justify-center text-on-secondary-fixed font-bold text-xs">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-bold leading-none">
                  {user.name || "User"}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps text-[9px] uppercase leading-none mt-0.5">
                  {user.role === "ADMIN" || user.role === "OPERATOR" ? "Studio Partner" : "Pelanggan"}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="ml-1 text-slate-400 hover:text-rose-700 transition"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-[2px_2px_0px_#2D2926] hover:bg-primary/90 transition"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}