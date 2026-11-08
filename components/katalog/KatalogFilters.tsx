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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-2 rounded-2xl shadow-[0_4px_16px_rgba(188,148,120,0.06)] mb-8">
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
            className={`px-4 py-2.5 rounded-full font-label-lg text-label-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat
                ? "bg-primary-container text-on-primary-container shadow-[2px_2px_0px_#1c1c19]"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cat === "all" ? "Semua Kategori" : cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl flex-1 md:w-64">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk cetak..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none focus:ring-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60"
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
          className="px-3 py-2 bg-surface-container text-on-surface-variant rounded-xl font-label-lg text-label-lg border-none focus:ring-0 outline-none cursor-pointer"
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