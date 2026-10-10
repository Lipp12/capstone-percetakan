import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Printer, ShieldCheck, Zap, ArrowRight, Clock } from "lucide-react";
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
  const heroImage =
    featuredProducts.find((product) => product.imageUrl)?.imageUrl ??
    "/uploads/products/1790264199799-shopping.webp";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate flex min-h-[480px] items-center overflow-hidden bg-slate-950 px-5 py-12 text-white sm:min-h-[520px] sm:px-8 lg:min-h-[560px]">
        <img
          src={heroImage}
          alt="Contoh hasil cetak poster dari Faeyza Printing"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-rose-950/60" />
        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-medium text-rose-100">Percetakan untuk usaha dan kebutuhan personal</p>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Faeyza Printing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              Spanduk, poster, kartu nama, dan kebutuhan cetak lainnya. Atur ukuran, pilih bahan, lalu pantau pesanan sampai siap diambil.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/katalog"
                className="flex items-center gap-2 rounded-md bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                <span>Pilih produk cetak</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/orders"
                className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lacak pesanan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Layanan */}
      <section className="w-full border-b border-stone-200 bg-[#f2ecdf] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-stone-300 md:grid-cols-3 md:divide-x md:divide-y-0">
          <article className="flex gap-4 py-5 md:py-2 md:pr-6">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Harga dihitung di awal</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Pilih ukuran, bahan, dan finishing untuk melihat estimasi sebelum memesan.</p>
            </div>
          </article>
          <article className="flex gap-4 py-5 md:px-6 md:py-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Desain diperiksa</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Tim pra-cetak meninjau file sebelum masuk ke proses produksi.</p>
            </div>
          </article>
          <article className="flex gap-4 py-5 md:py-2 md:pl-6">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Status pesanan terlihat</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Pantau proses dari pengecekan desain sampai pesanan siap diambil.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900 sm:text-3xl">
              Pilihan produk cetak
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lihat ukuran, bahan, dan harga awal setiap produk.
            </p>
          </div>
          <Link
            href="/katalog"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-rose-700 hover:text-rose-800"
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
      <footer className="mt-auto border-t border-stone-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Faeyza Printing. Sistem Informasi Transaksi dan Persediaan.</p>
      </footer>
    </div>
  );
}
