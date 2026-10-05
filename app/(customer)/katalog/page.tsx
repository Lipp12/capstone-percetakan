import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function KatalogPage({ searchParams }: Props) {
  const selectedCategory = searchParams.category || "all";
  const searchQuery = searchParams.search || "";

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

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
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

      {/* Filter Kategori & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 sm:p-4 rounded-lg border border-stone-200">
        {/* Kategori Tabs */}
        <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-1 sm:w-auto sm:flex-1">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/katalog?category=${cat}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition ${
                selectedCategory === cat
                  ? "bg-rose-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form method="GET" action="/katalog" className="relative w-full sm:w-64 sm:shrink-0">
          <input type="hidden" name="category" value={selectedCategory} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari produk cetak..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none"
          />
        </form>
      </div>

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
