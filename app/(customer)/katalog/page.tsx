import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import KatalogFilters from "@/components/katalog/KatalogFilters";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
  };
}

export default async function KatalogPage({ searchParams }: Props) {
  const selectedCategory = searchParams.category || "all";
  const searchQuery = searchParams.search || "";
  const sort = searchParams.sort || "newest";

  // Ambil semua kategori yang ada
  const allCategories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categories = ["all", ...allCategories.map((c) => c.category)];

  // Filter produk
  const whereClause: any = {};
  if (selectedCategory !== "all") {
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Katalog */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Katalog produk
          </h1>
          <p className="text-sm text-slate-500">
            Pilih kebutuhan cetak, bahan, dan finishing yang sesuai.
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500 shrink-0">
          {products.length} produk tersedia
        </p>
      </div>

      {/* Filter Kategori, Search & Sort (client component) */}
      <KatalogFilters
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        sort={sort}
      />

      {/* Grid Produk */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-stone-200 p-8 sm:p-12 text-center">
          <p className="text-base font-semibold text-slate-700">
            Tidak ada produk yang cocok dengan pencarian
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ganti kata kunci atau pilih kategori lain.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold transition"
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
