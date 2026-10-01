import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Filter, Search } from "lucide-react";

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
    <div className="space-y-8">
      {/* Header Katalog */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Katalog Produk Percetakan
        </h1>
        <p className="text-sm text-slate-500">
          Temukan produk cetak berkualitas terbaik dengan berbagai pilihan material dan opsi finishing terlengkap.
        </p>
      </div>

      {/* Filter Kategori & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Kategori Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/katalog?category=${cat}${searchQuery ? `&search=${searchQuery}` : ""}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form method="GET" action="/katalog" className="relative w-full sm:w-64">
          <input type="hidden" name="category" value={selectedCategory} />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Cari produk cetak..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </form>
      </div>

      {/* Grid Produk */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-base font-semibold text-slate-700">
            Tidak ada produk yang cocok dengan pencarian
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ganti kata kunci atau pilih kategori lain.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
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
