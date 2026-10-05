import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { ArrowRight, Layers, Tag } from "lucide-react";

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
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col hover:shadow-md hover:border-rose-300 transition-all duration-200 group">
      {/* Gambar Produk */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-700 bg-rose-50">
            <Tag className="w-9 h-9" />
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-slate-800 rounded-md shadow-sm">
          {product.category}
        </span>
        <span className="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold uppercase bg-slate-900/85 text-white rounded-md">
          Per {product.unit}
        </span>
      </div>

      {/* Konten Produk */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-700 transition line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pilihan Bahan yang Tersedia */}
        {product.materials && product.materials.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11px]">
              {product.materials.map((m) => m.material.name).join(", ")}
            </span>
          </div>
        )}

        {/* Footer Card: Harga & Tombol */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Mulai dari</span>
            <span className="text-sm sm:text-base font-bold text-rose-700">
              {formatRupiah(product.basePrice)}
            </span>
          </div>
          <Link
            href={`/order/${product.id}`}
            className="px-3 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition flex items-center gap-1 shrink-0"
          >
            <span>Pesan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
