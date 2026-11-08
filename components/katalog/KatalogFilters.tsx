"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Props {
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  sort: string;
}

export default function KatalogFilters({
  categories,
  selectedCategory,
  searchQuery,
  sort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      next.set(key, value);
    } else if (key === "category" && value === "all") {
      next.delete(key);
    } else if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // keep other params
    if (key !== "search") next.set("search", search);
    if (key !== "sort") next.set("sort", sort);
    if (key !== "category") {
      if (selectedCategory && selectedCategory !== "all") next.set("category", selectedCategory);
      else next.delete("category");
    }
    router.replace(`${pathname}?${next.toString()}`);
  }

  // Debounce pencarian
  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search) next.set("search", search);
      else next.delete("search");
      if (selectedCategory && selectedCategory !== "all") next.set("category", selectedCategory);
      else next.delete("category");
      if (sort) next.set("sort", sort);
      router.replace(`${pathname}?${next.toString()}`);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 sm:p-4 rounded-lg border border-stone-200">
      {/* Kategori Tabs */}
      <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-1 sm:w-auto sm:flex-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              const next = new URLSearchParams(params.toString());
              if (cat === "all") next.delete("category");
              else next.set("category", cat);
              if (search) next.set("search", search);
              else next.delete("search");
              if (sort) next.set("sort", sort);
              router.replace(`${pathname}?${next.toString()}`);
            }}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition ${
              selectedCategory === cat
                ? "bg-rose-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat === "all" ? "Semua Kategori" : cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-64 sm:shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk cetak..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none"
        />
      </div>

      {/* Sort */}
      <div className="w-full sm:w-44 sm:shrink-0">
        <select
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            next.set("sort", e.target.value);
            if (search) next.set("search", search);
            else next.delete("search");
            if (selectedCategory && selectedCategory !== "all") next.set("category", selectedCategory);
            else next.delete("category");
            router.replace(`${pathname}?${next.toString()}`);
          }}
          className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-md focus:ring-2 focus:ring-rose-600 focus:border-rose-600 outline-none"
        >
          <option value="newest">Terbaru</option>
          <option value="name-asc">Nama A-Z</option>
          <option value="name-desc">Nama Z-A</option>
          <option value="price-asc">Harga Termurah</option>
          <option value="price-desc">Harga Termahal</option>
        </select>
      </div>
    </div>
  );
}