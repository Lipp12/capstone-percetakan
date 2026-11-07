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
      {/* Header Halaman (Identik dengan format Header Semua Pesanan) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Kepuasan Pelanggan
          </span>
          <h1 className="text-2xl font-black text-ink-900 mt-1 flex items-center gap-2">
            <span>Ulasan & Penilaian Pelanggan</span>
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Daftar testimoni, penilaian bintang, dan masukan mutu cetakan dari pesanan yang telah selesai.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-ink-100 text-ink-600 self-start sm:self-auto">
          {reviews.length} Total Ulasan Masuk
        </span>
      </div>

      {/* 4 Cards Metrik Ringkasan (Identik dengan Dashboard Admin) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Rata-rata Skor */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-ink-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">
              Rata-rata Rating
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg sm:text-2xl font-bold text-ink-900">
              {stats.average}
            </p>
            <span className="text-xs font-semibold text-amber-600">/ 5.0</span>
          </div>
          <span className="text-[10px] text-ink-400">Dari seluruh pesanan selesai</span>
        </div>

        {/* Tingkat Kepuasan Positif */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-ink-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">
              Tingkat Kepuasan
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600">
            {stats.positivePercentage}%
          </p>
          <span className="text-[10px] text-ink-400">Rating bintang 4 & 5</span>
        </div>

        {/* Ulasan Sempurna 5 Bintang */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-ink-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">
              Bintang 5 Penuh
            </span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-md">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-ink-900">
            {stats.fiveStarCount}
          </p>
          <span className="text-[10px] text-ink-400">Pesanan dinilai sempurna</span>
        </div>

        {/* Total Ulasan Masuk */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-ink-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">
              Total Ulasan
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-md">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-ink-900">
            {stats.total}
          </p>
          <span className="text-[10px] text-ink-400">Ulasan tercatat di database</span>
        </div>
      </div>

      {/* Filter Status Bintang & Search Bar (Identik dengan Tabel Pesanan Masuk) */}
      <div className="bg-white p-4 rounded-3xl border border-ink-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {ratingTabs.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setFilterRating(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterRating === st.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan / produk / no order..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-ink-200 rounded-xl focus:ring-2 focus:ring-brand-600 outline-none transition"
          />
        </div>
      </div>

      {/* Tabel Rekap Ulasan (Identik dengan Format Tabel Admin Pesanan) */}
      <div className="bg-white rounded-3xl border border-ink-200 shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-ink-400 text-xs">
            <MessageSquare className="w-8 h-8 text-ink-300 mx-auto mb-2" />
            <p className="font-semibold text-ink-600">Tidak ada ulasan yang sesuai kriteria.</p>
            <p className="text-[11px] text-ink-400 mt-0.5">
              Ulasan akan otomatis tercatat saat pelanggan mengisi penilaian pesanan selesai.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink-700">
              <thead className="bg-ink-50 border-b border-ink-200 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
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
                  <tr key={rev.id} className="hover:bg-ink-50/80 transition">
                    {/* No. Pesanan & Tanggal */}
                    <td className="py-3.5 px-4 font-bold text-ink-900 align-top">
                      <span className="block font-bold text-ink-900">
                        {rev.order.orderNumber}
                      </span>
                      <span className="block text-[10px] text-ink-400 font-normal mt-0.5">
                        {formatDateTime(rev.createdAt)}
                      </span>
                    </td>

                    {/* Pelanggan */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold text-ink-900 block">
                        {rev.user.name}
                      </span>
                      <span className="text-[10px] text-ink-400 block">
                        {rev.user.email}
                      </span>
                      {rev.user.phone && (
                        <span className="text-[10px] text-ink-400 block">
                          {rev.user.phone}
                        </span>
                      )}
                    </td>

                    {/* Produk */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-medium text-ink-800 block">
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
                        <span className="text-xs font-bold text-ink-900 ml-1">
                          {rev.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Komentar Ulasan */}
                    <td className="py-3.5 px-4 align-top max-w-sm">
                      {rev.comment ? (
                        <p className="text-xs text-ink-700 leading-relaxed bg-ink-50 p-2.5 rounded-xl border border-ink-100/80">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      ) : (
                        <span className="text-[11px] text-ink-400 italic">
                          (Tanpa ulasan tertulis)
                        </span>
                      )}
                    </td>

                    {/* Aksi: Buka Detail Pesanan */}
                    <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${rev.order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-ink-200 text-ink-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 font-semibold text-[11px] transition shadow-2xs"
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
