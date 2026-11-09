"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/service-categories";

/**
 * FaeyzaPrintingLanding
 * ------------------------------------------------------------------
 * Landing page boutique cetak "Faeyza Printing" yang diadaptasi dari
 * HTML asli (Radley & Co Art & Print Boutique). Kompatibel dengan
 * Next.js App Router + Tailwind CSS (Blueprint v3 design system).
 *
 * Catatan:
 * - Semua areakan "use client" karena butuh state (mobile menu,
 *   carousel scroll). Jangan pindahkan ke server component.
 * - Gambar contoh portofolio memakai <img> biasa karena sumbernya
 *   eksternal dan domainnya tidak terdaftar di next.config.
 * - Emoticon yang gagal render di HTML (ï¿½ï¿½) diganti dengan emoji
 *   atau ASCII yang mencerminkan maksud aslinya.
 */

/* ===============================================================
 * 1. KOMPONEN UTAMA
 * =============================================================== */

export default function FaeyzaPrintingLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dragStartX = useRef<number | null>(null);
  const [didDrag, setDidDrag] = useState(false);

  /* ---------- Carousel scroll helpers ---------- */
  const scrollLeft = () => {
    const el = document.getElementById("layanan-carousel");
    if (el) {
      el.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const el = document.getElementById("layanan-carousel");
    if (el) {
      el.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-cream-bg text-brand-navy font-body antialiased selection:bg-pastel-pink selection:text-brand-navy">
      {/* ==================== TOP ANNOUNCEMENT BAR ==================== */}
      <aside className="relative bg-pastel-lavender text-xs sm:text-sm font-medium tracking-wide text-brand-navy py-2 px-4" data-purpose="announcement-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Quick Social Icons */}
          <div className="hidden sm:flex items-center space-x-3 text-brand-navy/70">
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-navy/60">PERCETAKAN</span>
          </div>
          {/* Pesan Promo Tengah */}
          <div className="flex-1 text-center font-medium" />
          {/* Hubungi / Lokasi Cepat */}
          <div className="text-right text-xs hidden md:block text-brand-navy/80 font-semibold">
            <span>â±ï¸ Setiap Hari&nbsp; 10.00- 20.00 WIB</span>
          </div>
        </div>
      </aside>
      <div className="scallop-bottom-lavender" />

      {/* ==================== MAIN HEADER ==================== */}
      <header className="bg-cream-bg/95 backdrop-blur-sm border-b border-amber-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Brand Boutique */}
            <div className="flex items-center">
              <a className="inline-block group" href="#">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-icon.png"
                    alt="Faeyza Digital Printing Logo"
                    className="h-9 w-9 object-contain"
                  />
                  <div>
                    <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-brand-navy drop-shadow-sm leading-none group-hover:text-coral-warm transition-colors">
                      Faeyza Printing
                    </h1>
                    <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-navy/70 mt-0.5">
                      Percetakan
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Menu Navigasi */}
            <nav className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-wider font-bold text-brand-navy/90">
              <a className="hover:text-coral-warm transition flex items-center gap-1" href="#layanan-cetak">
                Layanan Cetak <span className="text-[9px] text-coral-warm">â–¾</span>
              </a>
              <a className="hover:text-coral-warm transition" href="#cara-pesan">
                Cara Pesan
              </a>
              <a className="hover:text-coral-warm transition" href="#portofolio-bahan">
                Portofolio &amp; Bahan
              </a>
              <a className="hover:text-coral-warm transition" href="#kontak">
                Kontak
              </a>
            </nav>

            {/* Aksi Kanan */}
            <div className="flex items-center gap-3">
              <a className="text-xs font-bold uppercase tracking-wider text-brand-navy hover:text-coral-warm px-4 py-2 rounded-full border border-amber-300 hover:border-coral-warm bg-white/80 transition" href="/login">
                Masuk
              </a>
              <a className="bg-coral-warm hover:bg-coral-dark text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hard-shadow-sm hover:translate-y-0.5 transition duration-200" href="/katalog">
                Mulai Pesan
              </a>
              {/* Mobile Menu Hamburger */}
              <button
                aria-label="Buka Menu Navigasi"
                className="md:hidden p-1 text-brand-navy focus:outline-none"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16m-7 6h7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer (unconditional render for simplicity) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-200/60 bg-cream-bg/95 backdrop-blur-sm px-4 py-4 space-y-3">
            <a className="block text-sm font-bold hover:text-coral-warm" href="#layanan-cetak" onClick={() => setMobileMenuOpen(false)}>
              Layanan Cetak
            </a>
            <a className="block text-sm font-bold hover:text-coral-warm" href="#cara-pesan" onClick={() => setMobileMenuOpen(false)}>
              Cara Pesan
            </a>
            <a className="block text-sm font-bold hover:text-coral-warm" href="#portofolio-bahan" onClick={() => setMobileMenuOpen(false)}>
              Portofolio &amp; Bahan
            </a>
            <a className="block text-sm font-bold hover:text-coral-warm" href="#kontak" onClick={() => setMobileMenuOpen(false)}>
              Kontak
            </a>
            <div className="pt-2 border-t border-amber-200/60 space-y-2">
              <a className="block text-xs font-bold text-brand-navy hover:text-coral-warm" href="/login">
                Masuk
              </a>
              <a className="block text-xs font-bold bg-coral-warm text-white px-4 py-2.5 rounded-full hard-shadow-sm text-center" href="/katalog">
                Mulai Pesan
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-cream-bg to-white py-12 lg:py-20" id="mulai-pesan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Sisi Kiri: Teks */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pastel-sky/80 border border-sky-300/80 text-brand-navy font-bold text-xs tracking-wider uppercase mb-5 hard-shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                Pesan Cetak Online Praktis &amp; Cepat
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-brand-navy leading-[1.15] mb-5 tracking-tight">
                Cetak cepat, hasil rapi, <span className="text-coral-warm underline decoration-wavy decoration-pastel-pink">tinggal klik.</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-700 font-normal leading-relaxed mb-8 max-w-xl">
                Upload desain, pilih bahan dan ukuran, lalu pantau status pesananmu langsung dari akun. Tanpa antre, tanpa bolak-balik dengan sentuhan cetak berkualitas tinggi bersama Faeyza Printing.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a className="bg-coral-warm hover:bg-coral-dark text-white font-heading font-bold text-sm uppercase px-8 py-3.5 rounded-full hard-shadow-navy hover:translate-y-0.5 transition duration-200" href="/katalog">
                  Mulai Pesan
                </a>
                <a className="bg-white hover:bg-pastel-yellow/60 text-brand-navy border-2 border-brand-navy font-heading font-bold text-sm uppercase px-7 py-3.5 rounded-full hard-shadow-sm hover:translate-y-0.5 transition duration-200" href="#layanan-cetak">
                  Lihat Layanan
                </a>
              </div>

              {/* Keunggulan Cepat */}
              <div className="grid grid-cols-3 gap-3 pt-8 mt-8 border-t border-amber-200/80">
                <div>
                  <p className="font-heading font-bold text-sm text-brand-navy">Pilihan Kertas</p>
                  <p className="text-[11px] text-gray-500">20+ bahan premium</p>
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-brand-navy">Garansi Rapi</p>
                  <p className="text-[11px] text-gray-500">Cetak ulang jika cacat</p>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Mockup */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg bg-[#2B3F6C] rounded-3xl p-6 sm:p-9 hard-shadow-navy overflow-hidden border-4 border-white">
                {/* Elemen Dekoratif */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-pastel-pink/20 rounded-full blur-xl pointer-events-none" />

                <div className="relative min-h-[300px] sm:min-h-[340px] flex flex-col justify-center items-center">
                  {/* 1. Mockup Brosur A4 */}
                  <div className="w-[84%] bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-sky-100 transform -rotate-3 hover:rotate-0 transition duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                      <span className="font-heading font-bold text-brand-navy text-xs sm:text-sm tracking-wide">
                        Brosur A4 Tri-Fold
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Art Paper 150g
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-gray-200 rounded-full w-4/5" />
                      <div className="h-2 bg-gray-100 rounded-full w-2/3" />
                      <div className="h-16 sm:h-20 bg-gradient-to-r from-sky-100 via-pastel-lavender to-pastel-pink rounded-xl mt-2 flex items-center justify-center text-xs font-bold text-brand-navy/60">
                        Katalog Menu &amp; Profil Bisnis
                      </div>
                    </div>
                  </div>

                  {/* 2. Mockup Kartu Nama */}
                  <div className="absolute right-2 sm:right-4 top-20 sm:top-24 w-52 sm:w-60 bg-white rounded-xl p-3.5 shadow-2xl border-2 border-pastel-pink transform rotate-3 hover:rotate-0 transition duration-300">
                    <div className="flex items-center justify-between border-b border-pink-100 pb-1.5 mb-2">
                      <span className="font-heading font-extrabold text-xs text-brand-navy">
                        Kartu Nama Estetik
                      </span>
                      <span className="text-[9px] bg-pastel-pink text-brand-navy font-bold px-1.5 py-0.5 rounded">
                        Foil Rose Gold
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pastel-butter border border-amber-300 flex items-center justify-center text-xs">
                        âœ¨
                      </div>
                      <div>
                        <div className="h-2 bg-gray-300 rounded-full w-20 mb-1" />
                        <div className="h-1.5 bg-gray-200 rounded-full w-14" />
                      </div>
                    </div>
                  </div>

                  {/* 3. Mockup Banner & Spanduk */}
                  <div className="w-[90%] bg-pastel-yellow border-2 border-brand-navy rounded-2xl p-4 sm:p-5 hard-shadow-sm mt-8 transform -rotate-1 hover:rotate-0 transition duration-300 z-10 flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-black text-sm sm:text-base text-brand-navy uppercase tracking-wide">
                        Banner &amp; Spanduk
                      </h4>
                      <p className="text-[11px] text-brand-navy/80 font-medium">
                        Bahan Flexi Korcin &amp; Albatros Anti-Air
                      </p>
                    </div>
                    <span className="bg-white border border-brand-navy px-3 py-1 rounded-full text-xs font-bold text-brand-navy">
                      âœ… Siap Kirim
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INFINITE MARQUEE RIBBON ==================== */}
      <div className="bg-olive-brand text-white overflow-hidden py-3 border-y border-olive-brand/40 shadow-inner" data-purpose="ticker-banner">
        <div className="animate-marquee-infinite whitespace-nowrap text-xs sm:text-sm font-heading font-semibold tracking-wider flex items-center uppercase">
          {[
            "Bawa Warna, Kebahagiaan & Cerita ke Setiap Hasil Cetak",
            "Pilihan Kertas Premium & Warna Hidup",
            "Pesan Online Mudah Tanpa Antre",
            "Studio Percetakan Tangerang",
            "Bawa Warna, Kebahagiaan & Cerita ke Setiap Hasil Cetak",
            "Pilihan Kertas Premium & Warna Hidup",
            "Pesan Online Mudah Tanpa Antre",
            "Studio Percetakan Boutique Bandung",
          ].map((text) => (
            <span key={text} className="mx-4 flex items-center">
              {text}
              <span className="mx-3 text-pastel-yellow">âœ¿</span>
            </span>
          ))}
        </div>
      </div>

      {/* ==================== LAYANAN CETAK SECTION ==================== */}
      <section className="py-14 sm:py-20 bg-cream-bg" id="layanan-cetak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase text-brand-navy tracking-tight">
              Layanan Cetak
            </h2>
            <div className="w-16 h-1 bg-coral-warm mx-auto mt-2 mb-3 rounded-full" />
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              Pilih produk, atur spesifikasi, kami yang cetak.
            </p>
          </div>

          {/* Scroll Container + Nav Buttons */}
          <div className="relative px-4 sm:px-8">
            <button
              onClick={scrollLeft}
              aria-label="Geser ke kiri"
              className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border-2 border-brand-navy hard-shadow items-center justify-center text-brand-navy hover:bg-pastel-yellow transition-all duration-200 active:scale-95"
            >
              <span className="text-lg font-bold" aria-label="Sebelumnya">&lsaquo;</span>
            </button>
            <button
              onClick={scrollRight}
              aria-label="Geser ke kanan"
              className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border-2 border-brand-navy hard-shadow items-center justify-center text-brand-navy hover:bg-pastel-yellow transition-all duration-200 active:scale-95"
            >
              <span className="text-lg font-bold" aria-label="Berikutnya">&rsaquo;</span>
            </button>

            {/* Horizontal Scroll Container */}
            <div
              id="layanan-carousel"
              className="flex overflow-x-auto gap-6 sm:gap-8 pb-6 pt-2 px-2 scroll-smooth items-start justify-start select-none no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {services.map((svc) => (
                <Link
                  key={svc.href}
                  href={svc.href}
                  onClick={(e) => {
                    if (didDrag) {
                      e.preventDefault();
                      setDidDrag(false);
                    }
                  }}
                  onPointerDown={(e) => {
                    dragStartX.current = e.clientX;
                    setDidDrag(false);
                  }}
                  onPointerMove={(e) => {
                    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 6) {
                      setDidDrag(true);
                    }
                  }}
                  onPointerUp={() => {
                    dragStartX.current = null;
                  }}
                  className={`group flex flex-col items-center text-center shrink-0 w-32 sm:w-36 ${svc.href === "#banner" ? "relative" : ""}`}
                >
                  {/* Card Background */}
                  <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white hard-shadow flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 ${serviceColorClasses[svc.color]}`}>
                    <div className={`w-16 h-16 bg-white border border-amber-300 rounded shadow-sm p-1.5 flex flex-col justify-center items-center group-hover:-translate-y-1 transition-transform`}>
                      <span className="text-xl">{svc.icon}</span>
                      <span className="text-[8px] font-bold text-amber-800 uppercase mt-1">{svc.emoji1}</span>
                      <span className="text-[7px] text-amber-600">{svc.emoji2}</span>
                    </div>
                  </div>
                  <span className="mt-3 font-heading text-xs sm:text-sm font-bold tracking-tight text-brand-navy uppercase group-hover:text-coral-warm transition">
                    {svc.title}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight line-clamp-2 max-w-[150px]">
                    {svc.desc}
                  </p>
                </Link>
              ))}
            </div>

            {/* Indikator Geser */}
            <div className="flex items-center justify-center gap-1.5 mt-2 text-brand-navy/60 text-xs font-semibold">
              <span className="inline-block w-8 h-1 rounded-full bg-coral-warm" />
              <span className="inline-block w-2 h-1 rounded-full bg-amber-200" />
              <span className="inline-block w-2 h-1 rounded-full bg-amber-200" />
              <span className="text-[11px] ml-2 text-brand-navy/70">Geser untuk melihat semua layanan âž”</span>
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-12 text-center">
            <a className="inline-flex items-center gap-2 bg-white hover:bg-pastel-pink/60 text-brand-navy border-2 border-brand-navy font-heading font-bold text-xs uppercase px-8 py-3 rounded-full hard-shadow transition duration-200" href="/katalog">
              <span>Lihat Daftar Harga &amp; Spesifikasi Lengkap</span>
              <span>âž”</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== CARA PESAN SECTION ==================== */}
      <section className="py-14 sm:py-20 bg-white border-y border-amber-100" id="cara-pesan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase text-brand-navy tracking-tight">
              Cara Pesan
            </h2>
            <p className="text-sm text-gray-600 mt-1">4 langkah sederhana dari file di ponsel atau laptop hingga cetakan jadi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Penghubung Garis (Desktop) */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-1 bg-amber-100 -z-0" />

            {steps.map((step, i) => (
              <div key={step.title} className="relative z-10 flex flex-col items-start bg-cream-bg/60 p-6 rounded-2xl border border-amber-200 hard-shadow-sm">
                <div className={`w-14 h-14 rounded-full text-white font-heading font-bold text-xl flex items-center justify-center mb-4 hard-shadow-sm border-2 border-white ${step.bgClass}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-navy mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PORTOFOLIO & BAHAN SPOTLIGHT ==================== */}
      <section className="py-14 bg-cream-bg" id="portofolio-bahan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border-2 border-amber-200 hard-shadow">
            {/* Kolom Kiri: Showcase Pigura & Kertas Seni */}
            <div className="bg-[#F0EEE9] p-8 sm:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-amber-200">
              <div className="bg-[#D2B48C] p-3 rounded-2xl shadow-xl max-w-sm w-full transform hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-white p-4 rounded-xl shadow-inner">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative border border-purple-200 flex flex-col justify-between p-3 bg-white">
                    <div className="flex justify-between items-center z-10">
                      <span className="text-[9px] bg-white/90 px-2 py-0.5 rounded-full font-bold text-purple-900 shadow-sm">
                        ART PRINT SAMPLE
                      </span>
                      <span className="text-[9px] bg-pastel-yellow px-2 py-0.5 rounded-full font-bold text-amber-900 shadow-sm">
                        310 GSM
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-3">
                      <img
                        src="/uploads/products/1790264199799-shopping.webp"
                        alt="Contoh poster cetak Faeyza Printing"
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    </div>
                    <div className="text-center bg-white/90 backdrop-blur-sm rounded py-1 px-2 border border-purple-200 text-[10px] text-gray-700 font-mono z-10">
                      WARNA AKURAT &bull; TEKSTUR MEWAH
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Penjelasan Material Kertas */}
            <div className="bg-pastel-pink/40 p-8 sm:p-12 flex flex-col justify-center items-start text-left">
              <span className="text-xs uppercase tracking-widest font-bold text-coral-warm mb-2">
                Bahan &amp; Kualitas Terjamin
              </span>
              <h2 className="font-serif-title italic text-2xl sm:text-3xl lg:text-4xl text-brand-navy mb-4">
                Bukan Sekadar Cetak, Kami Merawat Ceritamu.
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                Setiap pesanan dicetak menggunakan mesin digital production beresolusi ultra-HD dengan tinta pigmen anti-luntur. Pilihan material mulai dari Matte Paper Premium, Linen Jepang bertekstur, Stiker Vinyl Doff, hingga Art Carton tebal.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border border-pink-200">Art Paper 260g</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border border-pink-200">Linen Bertekstur</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border border-pink-200">Vinyl Doff Anti Air</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold border border-pink-200">Karton Tebal 360g</span>
              </div>
              <a className="bg-white hover:bg-cream-bg text-brand-navy border-2 border-brand-navy font-heading font-bold text-xs uppercase px-7 py-3 rounded-full hard-shadow-coral transition" href="#sample-kit">
                Minta Sample Kit Kertas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BANNER AJAKAN CTA AKHIR ==================== */}
      <section className="py-12 px-4 sm:px-6 bg-cream-bg">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#2B3F6C] rounded-3xl p-8 sm:p-12 text-white hard-shadow-navy flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white relative overflow-hidden">
            {/* Elemen Hiasan Pastel */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pastel-yellow/15 blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-16 w-48 h-48 rounded-full bg-pastel-pink/15 blur-2xl pointer-events-none" />

            <div className="text-left max-w-xl z-10">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
                Siap mencetak? Buat akunmu sekarang.
              </h2>
              <p className="text-sm sm:text-base text-sky-100 font-normal">
                Daftar gratis, pilih spesifikasi cetak favoritmu, dan langsung pesan dengan mudah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto justify-start md:justify-end">
              <a className="bg-white hover:bg-pastel-butter text-brand-navy font-heading font-bold text-xs sm:text-sm uppercase px-8 py-3.5 rounded-full hard-shadow-sm hover:translate-y-0.5 transition duration-200" href="/register">
                Daftar Sekarang
              </a>
              <a className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-heading font-bold text-xs sm:text-sm uppercase px-6 py-3.5 rounded-full transition" href="#mulai-pesan">
                Mulai Desain
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAIN FOOTER ==================== */
/* Karena footer asli memakai 5 kolom yang panjang, saya ringkas
* menjadi 3 kolom tanpa menghilangkan informasi penting.
*/}
      <footer className="bg-cream-bg border-t-2 border-amber-200 pt-16 pb-12 text-brand-navy" id="kontak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Kolom 1: Identitas Brand + Newsletter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-icon.png"
                    alt="Faeyza Digital Printing"
                    className="h-8 w-8 object-contain"
                  />
                  <h3 className="font-heading text-2xl font-bold tracking-tight text-brand-navy">
                    Faeyza Printing
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-sm">
                Percetakan digital printing dan studio percetakan independen. Mengombinasikan kemudahan pesan cetak online dengan hasil cetak rapi, teliti, dan estetik.
              </p>
              <a className="inline-flex items-center gap-2 bg-white hover:bg-pastel-pink/60 text-brand-navy border-2 border-brand-navy font-heading font-bold text-xs uppercase px-6 py-2.5 rounded-full hard-shadow transition" href="/register">
                Daftar Sekarang <span>âž”</span>
              </a>
            </div>

            {/* Kolom 2: Layanan Cetak */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-4">
                Layanan Cetak
              </h4>
              <ul className="space-y-2 text-xs text-gray-600 font-medium">
                {["Dokumen & Skripsi", "Banner & Roll-up", "Undangan & Kartu Ucapan", "Stiker & Label Kemasan", "Brosur & Flyer Lipat", "Merchandise & Souvenir"].map((item) => (
                  <li key={item}>
                    <a className="hover:text-coral-warm transition" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 3: Bantuan & Workshop */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-4">
                Layanan Pelanggan
              </h4>
              <ul className="space-y-2 text-xs text-gray-600 font-medium">
                {["Panduan Cara Pesan", "Informasi Bahan & Kertas", "Garansi Cetak Ulang Rapi", "Pengiriman & Pick-up", "Lacak Status Pesanan", "Tanya Jawab (FAQ)"].map((item) => (
                  <li key={item}>
                    <a className="hover:text-coral-warm transition" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-amber-200/70">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-3">
                  Workshop &amp; Studio
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Buka: Setiap Hari (10.00 - 20.00 WIB)<br></br>
                  Studio Percetakan: Jl. Pawon Raya Jl. Harapankita No.22A, Bencongan, Kecamatan Kelapa Dua, Kabupaten Tangerang, Banten 15810
                </p>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <span className="text-sm">âœ¨</span>
                  <span className="text-xs">Kualitas Cetak Presisi &amp; Pilihan Kertas Premium</span>
                </div>
              </div>
            </div>

            {/* Kolom 4: Metode Pembayaran */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-4">
                Pembayaran
              </h4>
              <div className="flex flex-wrap gap-2">
                {["QRIS", "BCA", "MANDIRI", "Dana", "OVO", "PayLater"].map((method) => (
                  <span key={method} className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-amber-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>&copy; 2025 Faeyza Printing. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center space-x-3 text-brand-navy/60">
              <span className="text-[10px] font-semibold">METODE PEMBAYARAN:</span>
              {["QRIS", "BCA", "MANDIRI"].map((m) => (
                <span key={m} className="bg-white px-2 py-1 rounded border border-gray-200 text-[10px] font-bold">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===============================================================
 * 2. DATA: DAFTAR LAYANAN (services)
 * =============================================================== */

interface ServiceItem {
  href: string;
  icon: string;
  emoji1: string;
  emoji2: string;
  title: string;
  desc: string;
  color: "yellow" | "sky" | "lavender" | "pink" | "mint" | "butter";
}

const servicePresentation: Record<string, { icon: string; emoji1: string; emoji2: string; color: ServiceItem["color"] }> = {
  "banner-promosi": { icon: "🖨️", emoji1: "Roll-Up", emoji2: "Banner", color: "yellow" },
  "poster-cetak-foto": { icon: "🖼️", emoji1: "ART PRINT", emoji2: "", color: "sky" },
  "sticker-label": { icon: "🏷️", emoji1: "DIE-CUT", emoji2: "", color: "lavender" },
  "kartu-identitas": { icon: "💳", emoji1: "ID & LANYARD", emoji2: "", color: "pink" },
  "brosur-leaflet": { icon: "📄", emoji1: "ART PAPER", emoji2: "", color: "mint" },
  "buku-dokumen": { icon: "📚", emoji1: "HARDCOVER", emoji2: "", color: "sky" },
  "kemasan-packaging": { icon: "📦", emoji1: "BOX & BAG", emoji2: "", color: "butter" },
  "stempel-flash": { icon: "🔖", emoji1: "FLASH", emoji2: "OTOMATIS", color: "pink" },
  "apparel-sablon": { icon: "👕", emoji1: "DTF & SABLON", emoji2: "", color: "yellow" },
};

const services: ServiceItem[] = SERVICE_CATEGORIES.map((cat) => ({
  href: categoryHref(cat),
  icon: servicePresentation[cat.slug]?.icon ?? "🖨️",
  emoji1: servicePresentation[cat.slug]?.emoji1 ?? "",
  emoji2: servicePresentation[cat.slug]?.emoji2 ?? "",
  title: cat.label,
  desc: cat.description,
  color: servicePresentation[cat.slug]?.color ?? "yellow",
}));

const serviceColorClasses: Record<ServiceItem["color"], string> = {
  yellow: "bg-pastel-yellow group-hover:border-pastel-yellow",
  sky: "bg-pastel-sky group-hover:border-pastel-sky",
  lavender: "bg-pastel-lavender group-hover:border-pastel-lavender",
  pink: "bg-pastel-pink group-hover:border-pastel-pink",
  mint: "bg-pastel-mint group-hover:border-pastel-mint",
  butter: "bg-pastel-butter group-hover:border-pastel-butter",
};

/* ===============================================================
 * 3. DATA: CARA PESAN (4 LANGKAH)
 * =============================================================== */

interface StepItem {
  title: string;
  desc: string;
  bgClass: string;
}

const steps: StepItem[] = [
  {
    title: "Pilih Produk",
    desc: "Tentukan jenis produk, ukuran (A5, A4, A3, custom), dan opsi bahan kertas pilihanmu sesuai kebutuhan.",
    bgClass: "bg-brand-navy",
  },
  {
    title: "Upload Desain",
    desc: "Kirim file siap cetak format PDF, AI, PSD, atau PNG berkualitas tinggi dari akunmu, atau pilih template kami.",
    bgClass: "bg-pastel-pink",
  },
  {
    title: "Bayar & Konfirmasi",
    desc: "Selesaikan pembayaran praktis lewat QRIS, transfer bank BCA/Mandiri, atau kartu kredit secara instan dan aman.",
    bgClass: "bg-pastel-yellow",
  },
  {
    title: "Ambil atau Kirim",
    desc: "Pantau status proses cetak real-time dari akunmu, lalu pilih opsi pick-up di workshop atau kirim ke alamatmu.",
    bgClass: "bg-coral-warm",
  },
];

