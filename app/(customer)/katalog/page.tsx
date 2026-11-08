import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import KatalogFilters from "@/components/katalog/KatalogFilters";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    category?: string;
    kategori?: string;
    search?: string;
    sort?: string;
  };
}

export default async function KatalogPage({ searchParams }: Props) {
  const selectedCategory = searchParams.category || searchParams.kategori || "all";
  const searchQuery = searchParams.search || "";
  const sort = searchParams.sort || "newest";

  const activeService = SERVICE_CATEGORIES.find((s) => s.category === selectedCategory);
  const pageTitle = selectedCategory === "all"
    ? "Katalog produk"
    : activeService
    ? activeService.label
    : `Katalog: ${selectedCategory}`;
  const pageDesc = selectedCategory === "all"
    ? "Pilih kebutuhan cetak, bahan, dan finishing yang sesuai."
    : activeService
    ? activeService.description
    : "Menampilkan produk untuk kategori yang dipilih.";

  // Ambil semua kategori yang ada
  const allCategories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categories = ["all", ...allCategories.map((c) => c.category)];

  // Filter produk
  const whereClause: any = {};
  if (selectedCategory !== "all" && activeService) {
    whereClause.category = selectedCategory;
  }
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { basePrice: "asc" };
  else if (sort === "price-desc") orderBy = { basePrice: "desc" };
  else if (sort === "name-asc") orderBy = { name: "asc" };
  else if (sort === "name-desc") orderBy = { name: "desc" };

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy,
    include: {
      materials: {
        include: { material: true },
      },
    },
  });

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

      {/* Header Katalog */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-container-low rounded-3xl p-6 lg:p-8 relative overflow-hidden mb-8">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-primary-container/40 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-2 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-widest uppercase shadow-[2px_2px_0px_#1c1c19] w-fit">
            Studio Catalog
          </span>
          <h1 className="font-epilogue text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
            {pageTitle}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {pageDesc}
          </p>
        </div>
        <div className="text-right relative z-10 flex flex-col items-end gap-2">
          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
            {products.length} varian produk tersedia
          </span>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            100% Color-Accurate Proof
          </span>
        </div>
      </div>

      {/* Filter Kategori, Search & Sort (client component) */}
      <KatalogFilters
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        sort={sort}
      />

      {selectedCategory !== "all" && !activeService && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
          Kategori &quot;{selectedCategory}&quot; tidak dikenal. Menampilkan semua produk.
        </div>
      )}

      {/* Grid Produk */}
      {products.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 sm:p-12 text-center shadow-[0_4px_16px_rgba(188,148,120,0.06)]">
          <p className="text-base font-semibold text-on-surface">
            {selectedCategory !== "all" && !activeService
              ? `Kategori "${selectedCategory}" tidak dikenal. Menampilkan semua produk.`
              : selectedCategory !== "all"
              ? `Belum ada produk untuk kategori ini.`
              : "Tidak ada produk yang cocok dengan pencarian"}
          </p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            {selectedCategory !== "all"
              ? "Coba pilih kategori lain atau hapus filter."
              : "Coba ganti kata kunci atau pilih kategori lain."}
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-semibold transition shadow-[2px_2px_0px_#1c1c19]"
          >
            Reset Filter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
