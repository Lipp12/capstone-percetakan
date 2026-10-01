import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Layers, ShieldCheck, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      materials: {
        include: { material: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const finishings = await prisma.finishing.findMany();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Gambar Produk */}
        <div className="relative h-72 md:h-full min-h-[360px] bg-slate-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Tag className="w-16 h-16" />
            </div>
          )}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Informasi Produk */}
        <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Produk Unggulan Cetak
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {product.name}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">Harga dasar:</span>
              <span className="text-2xl font-black text-blue-700">
                {formatRupiah(product.basePrice)}
              </span>
              <span className="text-xs text-slate-500">/ {product.unit}</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Pilihan Bahan */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Pilihan Material / Bahan:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {product.materials.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {pm.material.name}
                      </span>
                      {pm.material.description && (
                        <span className="text-[11px] text-slate-500">
                          {pm.material.description}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-slate-700">
                      {pm.additionalPrice > 0
                        ? `+${formatRupiah(pm.additionalPrice)}`
                        : "Termasuk"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opsi Finishing */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Finishing Tersedia:
              </h4>
              <div className="flex flex-wrap gap-2">
                {finishings.map((f) => (
                  <span
                    key={f.id}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    {f.name} ({formatRupiah(f.price)}/{f.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tombol Pesan */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href={`/order/${product.id}`}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Kustomisasi & Pesan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
