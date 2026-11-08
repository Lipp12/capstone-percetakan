import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Layers, ShieldCheck, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: `${product.name} | Katalog Percetakan`,
    description: product.description,
  };
}

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
    <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-10 pt-8 pb-8 bg-background min-h-screen">
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-widest uppercase shadow-[2px_2px_0px_#1c1c19]">
          Katalog Standar Studio
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          Terkalibrasi CMYK
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          Presisi Lipat &amp; Potong
        </span>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
        <Link href="/katalog" className="hover:text-slate-900 transition">
          Katalog
        </Link>
        <span>›</span>
        <Link
          href={`/katalog?category=${encodeURIComponent(product.category)}`}
          className="hover:text-slate-900 transition"
        >
          {product.category}
        </Link>
        <span>›</span>
        <span className="text-slate-900 font-semibold">{product.name}</span>
      </nav>

      {/* Back button */}
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-[0_4px_16px_rgba(188,148,120,0.06)]">
        {/* Gambar Produk */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-high flex items-center justify-center">
          {product.imageUrl ? (
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <Tag className="w-16 h-16" />
            </div>
          )}
          <span className="absolute top-3 left-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-caps text-label-caps uppercase shadow-[2px_2px_0px_#1c1c19]">
            {product.category}
          </span>
        </div>

        {/* Informasi Produk */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">
                Produk Unggulan Cetak
              </span>
              <h1 className="font-epilogue text-3xl lg:text-4xl font-bold text-on-surface tracking-tight mt-1">
                {product.name}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex items-baseline gap-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">Harga dasar:</span>
              <span className="font-epilogue text-2xl font-bold text-primary">
                {formatRupiah(product.basePrice)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/ {product.unit}</span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
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
                    className="p-3 rounded-xl border border-outline-variant bg-surface-container text-xs flex items-center justify-between"
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
                    className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg text-xs font-medium"
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
              className="w-full py-4 px-6 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[2px_2px_0px_#1c1c19] hover:bg-primary-fixed transition-all flex items-center justify-center gap-2"
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
