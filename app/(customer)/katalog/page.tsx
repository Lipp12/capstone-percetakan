import { categories, products } from "@/lib/products";
import Link from "next/link";

export default function KatalogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-bold shadow-xs">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              KATALOG STANDAR STUDIO
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
              <span className="material-symbols-outlined text-[14px] text-tertiary">palette</span>
              TERKALIBRASI CMYK
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
              <span className="material-symbols-outlined text-[14px] text-primary">content_cut</span>
              PRESISI LIPAT &amp; POTONG
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Katalog Produk
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Pilihan media cetak berkualitas studio — banner, brosur, stiker, undangan, ID card, poster, dan dokumen. Tentukan spesifikasi dan dapatkan estimasi harga real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container px-4 py-3 rounded-2xl shadow-[0_2px_8px_rgba(188,148,120,0.06)] self-start lg:self-auto">
          <div className="w-10 h-10 rounded-xl bg-primary-container/80 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
          </div>
          <div className="text-left leading-tight">
            <div className="font-label-md text-label-md text-on-surface font-bold">100% Color-Accurate Proof</div>
            <div className="font-label-caps text-label-caps text-tertiary">Garansi Cetak Tajam &amp; Rapi</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            type="button"
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              idx === 0
                ? "bg-primary-container text-on-primary-container font-bold shadow-[2px_2px_0px_#2D2926] flex items-center gap-1.5"
                : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            {idx === 0 && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low px-5 py-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span>Semua Produk</span>
            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
              {products.length} varian tersedia
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(188,148,120,0.08)] hover:shadow-[0_8px_24px_rgba(160,120,100,0.16)] transition-all duration-300 border border-surface-container-high/40"
          >
            <div className="relative w-full h-56 bg-gradient-to-b from-[#daf1e1] to-[#cae8d3] flex items-center justify-center p-6 overflow-hidden">
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 font-label-caps text-label-caps text-tertiary shadow-xs font-bold">
                {product.badge}
              </span>
              <div className="relative w-28 h-28 bg-surface-container-lowest rounded-xl shadow-[0_8px_20px_rgba(45,41,38,0.18)] flex items-center justify-center border border-surface-container-high/60 transition-transform group-hover:scale-105 duration-300">
                <span className="material-symbols-outlined text-[48px] text-primary/40">
                  inventory_2
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow justify-between bg-surface-container-lowest">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {product.name}
                  </h3>
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">
                    {product.unit}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="mb-4 p-2.5 rounded-xl bg-surface-container-low/70 flex items-baseline justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Harga Mulai
                  </span>
                  <div className="text-right leading-none">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Rp {product.basePrice.toLocaleString("id-ID")}
                    </span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant">
                      {" "}
                      / {product.unit}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/katalog/${product.slug}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#c25028] hover:bg-[#a9421e] text-white font-label-md text-label-md shadow-[3px_3px_0px_#2D2926] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Pilih &amp; Atur →</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}