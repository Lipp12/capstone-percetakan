import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowRight, Layers } from "lucide-react";
import ProductImage from "./ProductImage";

interface ProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    basePrice: number;
    unit: string;
    imageUrl?: string | null;
    materials?: Array<{
      material: {
        name: string;
      };
    }>;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <div className="group flex flex-col bg-surface-container-lowest rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(160,120,100,0.12)] shadow-[0_4px_16px_rgba(188,148,120,0.06)] relative">
      {/* Gambar Produk */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-high mb-4 flex items-center justify-center">
        {product.imageUrl ? (
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <ProductImage src={null} alt={product.name} />
        )}
        <span className="absolute top-3 left-3 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-caps text-label-caps uppercase shadow-[2px_2px_0px_#1c1c19]">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary px-2.5 py-1 rounded-lg font-label-caps text-label-caps flex items-center gap-1 shadow-sm">
          Per {product.unit}
        </span>
      </div>

      {/* Konten Produk */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        <div className="flex flex-col gap-2 mb-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-epilogue font-bold text-lg text-on-surface tracking-tight line-clamp-1">
              {product.name}
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Pilihan Bahan yang Tersedia */}
        {product.materials && product.materials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.materials.map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-surface-container font-label-caps text-label-caps text-on-surface-variant"
              >
                {m.material.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer Card: Harga & Tombol */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-variant/50 mt-auto">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase">
              Mulai dari
            </span>
            <span className="font-epilogue text-xl font-bold text-primary">
              {formatRupiah(product.basePrice)}
            </span>
          </div>
          <Link
            href={`/order/${product.id}`}
            className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[2px_2px_0px_#1c1c19] hover:bg-primary-fixed transition-all flex items-center gap-1 shrink-0"
          >
            <span>Pesan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
