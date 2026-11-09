import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import ProductImage from "@/components/ProductImage";
import { ArrowLeft, ArrowRight, Check, Layers, ShieldCheck, Tag, Sparkles } from "lucide-react";

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
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog</span>
      </Link>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Gambar Produk */}
        <div className="relative h-72 md:h-full min-h-[360px] bg-gradient-to-b from-[#daf1e1] to-[#cae8d3] flex items-center justify-center">
          {product.imageUrl ? (
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/30">
              <Tag className="w-24 h-24" />
            </div>
          )}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md text-on-surface text-xs font-semibold shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Informasi Produk */}
        <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Produk Unggulan Cetak
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-on-surface mt-1">
                {product.name}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-primary-container/30 border border-primary/20 flex items-baseline gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Harga dasar:</span>
              <span className="text-2xl font-black text-primary">
                {formatRupiah(product.basePrice)}
              </span>
              <span className="text-xs text-on-surface-variant">/ {product.unit}</span>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.description}
            </p>

            {/* Pilihan Bahan */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                Pilihan Material / Bahan:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {product.materials.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-on-surface block">
                        {pm.material.name}
                      </span>
                      {pm.material.description && (
                        <span className="text-[11px] text-on-surface-variant">
                          {pm.material.description}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-on-surface-variant">
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
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-tertiary" />
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
          <div className="pt-4 border-t border-surface-container-low">
            <Link
              href={`/order/${product.id}`}
              className="w-full py-4 px-6 rounded-2xl bg-[#c25028] hover:bg-[#a9421e] text-white font-bold text-sm shadow-lg shadow-[#c25028]/25 transition flex items-center justify-center gap-2"
            >
              <span>Kustomisasi &amp; Pesan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
