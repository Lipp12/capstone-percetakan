import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Printer, Sparkles, ShieldCheck, Zap, ArrowRight, Layers, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      materials: {
        include: { material: true },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mt-4">
            Cetak Kebutuhan Bisnis Anda{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              Cepat & Tanpa Ribet
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Spanduk, banner, poster, kartu nama hingga merchandise. Hitung estimasi harga otomatis, upload desain langsung, dan pantau produksi secara real-time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/katalog"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
            >
              <span>Jelajahi Katalog Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Keunggulan Layanan */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Kalkulator Harga Instan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih ukuran meteran, bahan, dan finishing. Harga langsung terhitung otomatis tanpa perlu menunggu penawaran admin.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Validasi Desain (Quality Gate)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setiap file diperiksa resolusi dan kelayakannya oleh tim pra-cetak agar hasil cetak tajam dan tidak pecah.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Live Tracking Produksi
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pantau setiap tahapan pesanan: Verifikasi Bayar → Pengecekan Desain → Cetak → Finishing → Siap Diambil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Produk Paling Populer
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Pilihan cetak favorit pelanggan bisnis dan perorangan
            </p>
          </div>
          <Link
            href="/katalog"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>© 2026 CetakKilat - Sistem Percetakan Online Terpadu. All rights reserved.</p>
      </footer>
    </div>
  );
}
