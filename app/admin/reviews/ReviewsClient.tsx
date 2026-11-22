"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  Star,
  Search,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  User,
  TrendingUp,
  Award,
  ThumbsUp,
  FileText,
} from "lucide-react";
import AdminStatCard from "@/components/AdminStatCard";

interface ReviewItem {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    totalPrice: number;
    createdAt: string | Date;
  };
}

interface Props {
  initialReviews: ReviewItem[];
}

export default function ReviewsClient({ initialReviews }: Props) {
  const [reviews] = useState<ReviewItem[]>(initialReviews);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<string>("ALL");

  // Perhitungan statistik metrik
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: "0.0",
        fiveStarCount: 0,
        positivePercentage: 0,
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const positivePercentage = Math.round((positive / total) * 100);

    return {
      total,
      average,
      fiveStarCount: fiveStar,
      positivePercentage,
    };
  }, [reviews]);

  // Filter ulasan
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterRating !== "ALL") {
        if (filterRating === "LOW") {
          if (r.rating > 2) return false;
        } else {
          if (r.rating !== Number(filterRating)) return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const customerName = r.user?.name?.toLowerCase() || "";
        const customerEmail = r.user?.email?.toLowerCase() || "";
        const orderNumber = r.order?.orderNumber?.toLowerCase() || "";
        const productName = r.product?.name?.toLowerCase() || "";
        const comment = r.comment?.toLowerCase() || "";

        return (
          customerName.includes(q) ||
          customerEmail.includes(q) ||
          orderNumber.includes(q) ||
          productName.includes(q) ||
          comment.includes(q)
        );
      }

      return true;
    });
  }, [reviews, search, filterRating]);

  const ratingTabs = [
    { label: "Semua", value: "ALL" },
    { label: "★ 5 Bintang", value: "5" },
    { label: "★ 4 Bintang", value: "4" },
    { label: "★ 3 Bintang", value: "3" },
    { label: "★ 1-2 Bintang", value: "LOW" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Rata-rata Rating"
          value={`${stats.average} / 5.0`}
          caption="Dari seluruh pesanan selesai"
          icon={Star}
          tone="yellow"
        />
        <AdminStatCard
          label="Tingkat Kepuasan"
          value={`${stats.positivePercentage}%`}
          caption="Rating bintang 4 & 5"
          icon={ThumbsUp}
          tone="mint"
        />
        <AdminStatCard
          label="Bintang 5 Penuh"
          value={stats.fiveStarCount}
          caption="Pesanan dinilai sempurna"
          icon={Award}
          tone="rose"
        />
        <AdminStatCard
          label="Total Ulasan"
          value={stats.total}
          caption="Ulasan tercatat di database"
          icon={MessageSquare}
          tone="lavender"
        />
      </div>

      {/* Filter Status Bintang & Search Bar (Identik dengan Tabel Pesanan Masuk) */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {ratingTabs.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setFilterRating(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterRating === st.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-[#ece3d4]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan / produk / no order..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-xl focus:ring-2 focus:ring-brand-600 outline-none transition"
          />
        </div>
      </div>

      {/* Tabel Rekap Ulasan (Identik dengan Format Tabel Admin Pesanan) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-outline text-xs">
            <MessageSquare className="w-8 h-8 text-outline mx-auto mb-2" />
            <p className="font-semibold text-on-surface-variant">Tidak ada ulasan yang sesuai kriteria.</p>
            <p className="text-[11px] text-outline mt-0.5">
              Ulasan akan otomatis tercatat saat pelanggan mengisi penilaian pesanan selesai.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface-variant">
              <thead className="bg-surface-container-low border-b border-outline-variant text-outline font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">No. Pesanan & Tanggal</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Produk Cetak</th>
                  <th className="py-3.5 px-4">Nilai Kepuasan</th>
                  <th className="py-3.5 px-4">Ulasan & Masukan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-surface-container-low/80 transition">
                    {/* No. Pesanan & Tanggal */}
                    <td className="py-3.5 px-4 font-bold text-on-surface align-top">
                      <span className="block font-bold text-on-surface">
                        {rev.order.orderNumber}
                      </span>
                      <span className="block text-[10px] text-outline font-normal mt-0.5">
                        {formatDateTime(rev.createdAt)}
                      </span>
                    </td>

                    {/* Pelanggan */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold text-on-surface block">
                        {rev.user.name}
                      </span>
                      <span className="text-[10px] text-outline block">
                        {rev.user.email}
                      </span>
                      {rev.user.phone && (
                        <span className="text-[10px] text-outline block">
                          {rev.user.phone}
                        </span>
                      )}
                    </td>

                    {/* Produk */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-medium text-on-surface block">
                        {rev.product.name}
                      </span>
                    </td>

                    {/* Rating Bintang */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-ink-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-on-surface ml-1">
                          {rev.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Komentar Ulasan */}
                    <td className="py-3.5 px-4 align-top max-w-sm">
                      {rev.comment ? (
                        <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 rounded-xl border border-surface-container/80">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      ) : (
                        <span className="text-[11px] text-outline italic">
                          (Tanpa ulasan tertulis)
                        </span>
                      )}
                    </td>

                    {/* Aksi: Buka Detail Pesanan */}
                    <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${rev.order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-brand-300 hover:bg-surface-container/50 font-semibold text-[11px] transition shadow-2xs"
                        title="Buka detail pesanan di panel admin"
                      >
                        <span>Lihat Order</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
